'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { YearTermFilter } from './YearTermFilter'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { Level, Term } from '@prisma/client'

interface Child {
  id: string
  name: string
}

interface Subject {
  id: string
  name: string
}

interface Rating {
  id: string
  year: number
  term: Term
  level: Level
  childId: string
  subjectId: string
}

export function RatingsGrid() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [term, setTerm] = useState<Term>('MID')
  const queryClient = useQueryClient()

  const { data: children = [] } = useQuery<Child[]>({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await fetch('/api/children')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await fetch('/api/subjects')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const { data: ratings = [] } = useQuery<Rating[]>({
    queryKey: ['ratings', year, term],
    queryFn: async () => {
      const res = await fetch(`/api/ratings?year=${year}&term=${term}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const upsertMutation = useMutation({
    mutationFn: async (data: {
      year: number
      term: Term
      level: Level
      childId: string
      subjectId: string
    }) => {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save rating')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings', year, term] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast({ title: 'Rating saved' })
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })

  const getRating = (childId: string, subjectId: string): Level | undefined => {
    const rating = ratings.find((r) => r.childId === childId && r.subjectId === subjectId)
    return rating?.level
  }

  const handleRatingChange = (childId: string, subjectId: string, level: Level) => {
    upsertMutation.mutate({ year, term, level, childId, subjectId })
  }

  if (children.length === 0 || subjects.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Ratings Grid</h2>
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            Please add children and subjects before entering ratings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ratings Grid</h2>
      </div>

      <YearTermFilter
        year={year}
        term={term}
        onYearChange={setYear}
        onTermChange={setTerm}
        availableYears={[2023, 2024, 2025, 2026]}
      />

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-background z-10">Child</TableHead>
              {subjects.map((subject) => (
                <TableHead key={subject.id} className="min-w-[180px]">
                  {subject.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child) => (
              <TableRow key={child.id}>
                <TableCell className="font-medium sticky left-0 bg-background">
                  {child.name}
                </TableCell>
                {subjects.map((subject) => {
                  const currentRating = getRating(child.id, subject.id)
                  return (
                    <TableCell key={subject.id}>
                      <Select
                        value={currentRating || ''}
                        onValueChange={(value) =>
                          handleRatingChange(child.id, subject.id, value as Level)
                        }
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-label={`Rating for ${child.name} in ${subject.name}`}
                        >
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EXCELLENT">Excellent</SelectItem>
                          <SelectItem value="MODERATE">Moderate</SelectItem>
                          <SelectItem value="LOW">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Select a rating for each child-subject combination. Changes are saved automatically.
      </p>
    </div>
  )
}