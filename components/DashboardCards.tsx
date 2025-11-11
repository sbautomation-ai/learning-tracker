'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, Star } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface DashboardData {
  totalStudents: number
  totalObjectives: number
  totalRatings: number
  averageRating: number
}

export function DashboardCards() {
  const [data, setData] = useState<DashboardData>({
    totalStudents: 0,
    totalObjectives: 0,
    totalRatings: 0,
    averageRating: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      const studentsRes = await fetch('/api/children')
      const students = await studentsRes.json()
      
      const objectivesRes = await fetch('/api/subjects')
      const objectives = await objectivesRes.json()
      
      const ratingsRes = await fetch('/api/ratings')
      const ratings = await ratingsRes.json()
      
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum: number, r: { value: number }) => sum + r.value, 0) / ratings.length
        : 0

      setData({
        totalStudents: students.length,
        totalObjectives: objectives.length,
        totalRatings: ratings.length,
        averageRating: Math.round(avgRating * 10) / 10,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Objectives</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalObjectives}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRatings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageRating}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}