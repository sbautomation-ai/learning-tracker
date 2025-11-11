import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    
    const objectives = await prisma.learningObjective.findMany({
      where: classId ? { classId } : undefined,
      include: { class: true },
      orderBy: { title: 'asc' },
    })
    return NextResponse.json(objectives)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch learning objectives' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const objective = await prisma.learningObjective.create({
      data: {
        title: body.title,
        description: body.description,
        subject: body.subject,
        classId: body.classId,
      },
      include: { class: true },
    })
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

    await prisma.learningObjective.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete learning objective' }, { status: 500 })
  }
}