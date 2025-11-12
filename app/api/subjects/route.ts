import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    
    let query = supabase
      .from('LearningObjective')
      .select('*, class:Class(*)')
      .order('title', { ascending: true })

    if (classId) {
      query = query.eq('classId', classId)
    }

    const { data: objectives, error } = await query

    if (error) throw error
    return NextResponse.json(objectives)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch learning objectives' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data: objective, error } = await supabase
      .from('LearningObjective')
      .insert({
        title: body.title,
        description: body.description,
        subject: body.subject,
        classId: body.classId,
      })
      .select('*, class:Class(*)')
      .single()

    if (error) throw error
    return NextResponse.json(objective)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create learning objective' }, { status: 500 })
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
      .from('LearningObjective')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete learning objective' }, { status: 500 })
  }
}