import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    const ratings = await prisma.rating.findMany({
      where: {
        student: {
          classId: classId,
        },
      },
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
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}