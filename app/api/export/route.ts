import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    const { data: ratings, error } = await supabase
      .from('Rating')
      .select(`
        *,
        student:Student!inner(*, class:Class(*)),
        learningObjective:LearningObjective(*)
      `)
      .eq('student.classId', classId)
      .order('createdAt', { ascending: false })

    if (error) throw error
    return NextResponse.json(ratings)
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}