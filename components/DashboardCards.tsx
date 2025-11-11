'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { YearTermFilter } from './YearTermFilter'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Download, Users, BookOpen, Star } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { Level, Term } from '@prisma/client'

interface DashboardData {
  totalChildren: number
  totalSubjects: number
  totalRatings: number
  ratingDistribution: { level: Level; count: number }[]
  subjectBreakdown: { subject: string; excellent: number; moderate: number; low: number }[]
  childSummary: { child: string; excellent: number; moderate: number; low: number; total: number }[]
}

const COLORS = {
  EXCELLENT: '#10b981',
  MODERATE: '#f59e0b',
  LOW: '#ef4444',
}

export function DashboardCards() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const [term, setTerm] = useState<Term>('MID')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [isExporting, setIsExporting] = useState(false)

  const { data: subjects = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      const res = await fetch('/api/subjects')
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', year, term, subjectFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ year: year.toString(), term })
      if (subjectFilter !== 'all') params.append('subjectId', subjectFilter)
      const res = await fetch(`/api/ratings?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const ratings = await res.json()

      // Calculate statistics
      const totalRatings = ratings.length
      const distribution = ratings.reduce(
        (acc: Record<Level, number>, r: { level: Level }) => {
          acc[r.level] = (acc[r.level] || 0) + 1
          return acc
        },
        {} as Record<Level, number>
      )

      // Get unique counts
      const childrenRes = await fetch('/api/children')
      const subjectsRes = await fetch('/api/subjects')
      const children = await childrenRes.json()
      const allSubjects = await subjectsRes.json()

      // Subject breakdown
      const subjectMap = new Map<string, { excellent: number; moderate: number; low: number }>()
      ratings.forEach((r: { subject: { name: string }; level: Level }) => {
        const name = r.subject.name
        if (!subjectMap.has(name)) {
          subjectMap.set(name, { excellent: 0, moderate: 0, low: 0 })
        }
        const stats = subjectMap.get(name)!
        if (r.level === 'EXCELLENT') stats.excellent++
        else if (r.level === 'MODERATE') stats.moderate++
        else stats.low++
      })

      // Child summary
      const childMap = new Map<string, { excellent: number; moderate: number; low: number }>()
      ratings.forEach((r: { child: { name: string }; level: Level }) => {
        const name = r.child.name
        if (!childMap.has(name)) {
          childMap.set(name, { excellent: 0, moderate: 0, low: 0 })
        }
        const stats = childMap.get(name)!
        if (r.level === 'EXCELLENT') stats.excellent++
        else if (r.level === 'MODERATE') stats.moderate++
        else stats.low++
      })

      return {
        totalChildren: children.length,
        totalSubjects: allSubjects.length,
        totalRatings,
        ratingDistribution: Object.entries(distribution).map(([level, count]) => ({
          level: level as Level,
          count,
        })),
        subjectBreakdown: Array.from(subjectMap.entries()).map(([subject, stats]) => ({
          subject,
          ...stats,
        })),
        childSummary: Array.from(childMap.entries()).map(([child, stats]) => ({
          child,
          ...stats,
          total: stats.excellent + stats.moderate + stats.low,
        })),
      }
    },
  })

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const params = new URLSearchParams({ year: year.toString(), term })
      if (subjectFilter !== 'all') params.append('subjectId', subjectFilter)
      
      const res = await fetch(`/api/export?${params}`)
      if (!res.ok) throw new Error('Export failed')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ratings_export_${year}_${term}_${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({ title: 'Export successful' })
    } catch (error) {
      toast({ title: 'Export failed', variant: 'destructive' })
    } finally {
      setIsExporting(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  const distributionData = data?.ratingDistribution.map((d) => ({
    name: d.level === 'EXCELLENT' ? 'Excellent' : d.level === 'MODERATE' ? 'Moderate' : 'Low',
    value: d.count,
    fill: COLORS[d.level],
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Overview of learning objectives and ratings</p>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export to Excel'}
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <YearTermFilter
          year={year}
          term={term}
          onYearChange={setYear}
          onTermChange={setTerm}
          availableYears={[2023, 2024, 2025, 2026]}
        />

        <div className="space-y-2">
          <Label htmlFor="subject-filter">Filter by Subject</Label>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger id="subject-filter" className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalChildren || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalSubjects || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ratings Entered</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalRatings || 0}</div>
            <p className="text-xs text-muted-foreground">
              For {term === 'MID' ? 'Mid-Year' : 'End-Year'} {year}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>Breakdown of all ratings for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No ratings data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Rating breakdown by subject</CardDescription>
          </CardHeader>
          <CardContent>
            {data && data.subjectBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.subjectBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="excellent" fill={COLORS.EXCELLENT} name="Excellent" />
                  <Bar dataKey="moderate" fill={COLORS.MODERATE} name="Moderate" />
                  <Bar dataKey="low" fill={COLORS.LOW} name="Low" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No subject data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Child Summary</CardTitle>
          <CardDescription>Performance overview per child</CardDescription>
        </CardHeader>
        <CardContent>
          {data && data.childSummary.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Child</th>
                    <th className="text-right p-2">Excellent</th>
                    <th className="text-right p-2">Moderate</th>
                    <th className="text-right p-2">Low</th>
                    <th className="text-right p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.childSummary.map((row) => (
                    <tr key={row.child} className="border-b">
                      <td className="p-2 font-medium">{row.child}</td>
                      <td className="text-right p-2" style={{ color: COLORS.EXCELLENT }}>
                        {row.excellent}
                      </td>
                      <td className="text-right p-2" style={{ color: COLORS.MODERATE }}>
                        {row.moderate}
                      </td>
                      <td className="text-right p-2" style={{ color: COLORS.LOW }}>
                        {row.low}
                      </td>
                      <td className="text-right p-2 font-semibold">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No child data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}