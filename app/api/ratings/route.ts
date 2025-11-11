import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { ratingUpdateSchema } from '@/lib/validation'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const term = searchParams.get('term')
    const subjectId = searchParams.get('subjectId')

    const where: Prisma.RatingWhereInput = {}
    if (year) where.year = parseInt(year)
    if (term) where.term = term as 'MID' | 'END'
    if (subjectId) where.subjectId = subjectId

    const ratings = await prisma.rating.findMany({
      where,
      include: {
        child: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } },
      },
      orderBy: [{ year: 'desc' }, { term: 'asc' }],
    })

    return NextResponse.json(ratings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = ratingUpdateSchema.parse(body)

    // Upsert: update if exists, create if not
    const rating = await prisma.rating.upsert({
      where: {
        unique_rating_per_slot: {
          childId: validated.childId,
          subjectId: validated.subjectId,
          year: validated.year,
          term: validated.term,
        },
      },
      update: {
        level: validated.level,
      },
      create: {
        year: validated.year,
        term: validated.term,
        level: validated.level,
        childId: validated.childId,
        subjectId: validated.subjectId,
      },
    })

    return NextResponse.json(rating)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Rating already exists for this combination' },
          { status: 400 }
        )
      }
    }
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }
}