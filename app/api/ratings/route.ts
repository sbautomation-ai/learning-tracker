import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const learningObjectiveId = searchParams.get('learningObjectiveId')
    const classId = searchParams.get('classId')

    const where: Record<string, any> = {}
    
    if (studentId) where.studentId = studentId
    if (learningObjectiveId) where.learningObjectiveId = learningObjectiveId
    if (classId) {
      where.student = {
        classId: classId
      }
    }

    const ratings = await prisma.rating.findMany({
      where,
      include: {
        student: {
          include: {
            class: true,
          },
        },
        learningObjective: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(ratings)
  } catch (error) {
    console.error('Ratings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const rating = await prisma.rating.upsert({
      where: {
        studentId_learningObjectiveId: {
          studentId: body.studentId,
          learningObjectiveId: body.learningObjectiveId,
        },
      },
      update: {
        value: body.value,
        notes: body.notes,
      },
      create: {
        studentId: body.studentId,
        learningObjectiveId: body.learningObjectiveId,
        value: body.value,
        notes: body.notes,
      },
      include: {
        student: true,
        learningObjective: true,
      },
    })

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

    await prisma.rating.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Rating delete error:', error)
    return NextResponse.json({ error: 'Failed to delete rating' }, { status: 500 })
  }
}