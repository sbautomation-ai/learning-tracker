import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateExcelFile, ExportRating } from '@/lib/export'
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
        child: true,
        subject: true,
      },
      orderBy: [{ year: 'desc' }, { term: 'asc' }, { child: { name: 'asc' } }],
    })

    const exportData: ExportRating[] = ratings.map((r) => ({
      year: r.year,
      term: r.term,
      childName: r.child.name,
      subjectName: r.subject.name,
      rating: r.level,
    }))

    const buffer = generateExcelFile(exportData)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="ratings_export_${Date.now()}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}