import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, Star, BarChart3 } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Learning Objectives Tracker</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Track student progress with twice-yearly ratings, visualize performance, and export data
          to Excel
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <Users className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Children</CardTitle>
            <CardDescription>Manage student records</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/children">
              <Button className="w-full">Manage Children</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BookOpen className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Define learning objectives</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/subjects">
              <Button className="w-full">Manage Subjects</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Star className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Ratings</CardTitle>
            <CardDescription>Enter mid/end year ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ratings">
              <Button className="w-full">Enter Ratings</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <BarChart3 className="h-8 w-8 mb-2 text-primary" />
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>View analytics & export</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">View Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 md:grid-cols-2">
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Track children and learning objectives</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Mid-year and end-year ratings</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Visual dashboard with charts</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Excel export functionality</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Multi-year tracking</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✓</span>
              <span>Accessible and keyboard-friendly</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}