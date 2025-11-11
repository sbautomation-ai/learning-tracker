import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { childSchema } from '@/lib/validation'
import { z } from 'zod'

export async function GET() {
  try {
    const children = await prisma.child.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(children)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch children' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = childSchema.parse(body)
    const child = await prisma.child.create({ data: validated })
    return NextResponse.json(child, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create child' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const body = await request.json()
    const validated = childSchema.parse(body)
    const child = await prisma.child.update({
      where: { id },
      data: validated,
    })
    return NextResponse.json(child)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update child' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    await prisma.child.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete child' }, { status: 500 })
  }
}