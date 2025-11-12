import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const learningObjectiveId = searchParams.get('learningObjectiveId')
    const classId = searchParams.get('classId')

    let query = supabase
      .from('Rating')
      .select(`
        *,
        student:Student(*, class:Class(*)),
        learningObjective:LearningObjective(*)
      `)
      .order('createdAt', { ascending: false })

    if (studentId) query = query.eq('studentId', studentId)
    if (learningObjectiveId) query = query.eq('learningObjectiveId', learningObjectiveId)
    if (classId) query = query.eq('student.classId', classId)

    const { data: ratings, error } = await query

    if (error) throw error
    return NextResponse.json(ratings)
  } catch (error) {
    console.error('Ratings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const { data: rating, error } = await supabase
      .from('Rating')
      .upsert(
        {
          studentId: body.studentId,
          learningObjectiveId: body.learningObjectiveId,
          value: body.value,
          notes: body.notes,
        },
        {
          onConflict: 'studentId,learningObjectiveId',
        }
      )
      .select(`
        *,
        student:Student(*),
        learningObjective:LearningObjective(*)
      `)
      .single()

    if (error) throw error
    return NextResponse.json(rating)
  } catch (error) {
    console.error('Rating create/update error:', error)
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('Rating')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Rating delete error:', error)
    return NextResponse.json({ error: 'Failed to delete rating' }, { status: 500 })
  }
}