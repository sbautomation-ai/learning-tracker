'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

interface Student {
  id: string
  name: string
}

interface LearningObjective {
  id: string
  title: string
  subject: string
}

interface Rating {
  id: string
  value: number
  studentId: string
  learningObjectiveId: string
  notes?: string
}

export function RatingsGrid() {
  const queryClient = useQueryClient()

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['children'],
    queryFn: async () => {
      const res = await fetch('/api/children')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const { data: objectives = [] } = useQuery<LearningObjective[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await fetch('/api/subjects')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const { data: ratings = [] } = useQuery<Rating[]>({
    queryKey: ['ratings'],
    queryFn: async () => {
      const res = await fetch('/api/ratings')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const upsertMutation = useMutation({
    mutationFn: async (data: {
      value: number
      studentId: string
      learningObjectiveId: string
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
      queryClient.invalidateQueries({ queryKey: ['ratings'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast({ title: 'Rating saved' })
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: 'destructive' })
    },
  })

  const getRating = (studentId: string, objectiveId: string): number | undefined => {
    const rating = ratings.find((r) => r.studentId === studentId && r.learningObjectiveId === objectiveId)
    return rating?.value
  }

  const handleRatingChange = (studentId: string, objectiveId: string, value: number) => {
    upsertMutation.mutate({ value, studentId, learningObjectiveId: objectiveId })
  }

  if (students.length === 0 || objectives.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Ratings Grid</h2>
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            Please add students and learning objectives before entering ratings
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

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-background z-10">Student</TableHead>
              {objectives.map((objective) => (
                <TableHead key={objective.id} className="min-w-[180px]">
                  {objective.title}
                  <div className="text-xs text-muted-foreground">{objective.subject}</div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium sticky left-0 bg-background">
                  {student.name}
                </TableCell>
                {objectives.map((objective) => {
                  const currentRating = getRating(student.id, objective.id)
                  return (
                    <TableCell key={objective.id}>
                      <Select
                        value={currentRating?.toString() || ''}
                        onValueChange={(value) =>
                          handleRatingChange(student.id, objective.id, parseInt(value))
                        }
                      >
                        <SelectTrigger
                          className="w-full"
                          aria-label={`Rating for ${student.name} in ${objective.title}`}
                        >
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Beginning</SelectItem>
                          <SelectItem value="2">2 - Developing</SelectItem>
                          <SelectItem value="3">3 - Proficient</SelectItem>
                          <SelectItem value="4">4 - Advanced</SelectItem>
                          <SelectItem value="5">5 - Mastery</SelectItem>
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
        Select a rating (1-5) for each student-objective combination. Changes are saved automatically.
      </p>
    </div>
  )
}