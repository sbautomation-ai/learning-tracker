import * as XLSX from 'xlsx'
import { Level, Term } from '@prisma/client'

export interface ExportRating {
  year: number
  term: Term
  childName: string
  subjectName: string
  rating: Level
}

export function generateExcelFile(ratings: ExportRating[]): Buffer {
  // Transform data for Excel
  const data = ratings.map((r) => ({
    Year: r.year,
    Term: r.term === 'MID' ? 'Mid-Year' : 'End-Year',
    Child: r.childName,
    Subject: r.subjectName,
    Rating: formatRatingLevel(r.rating),
  }))

  // Create workbook
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ratings')

  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },  // Year
    { wch: 12 }, // Term
    { wch: 20 }, // Child
    { wch: 25 }, // Subject
    { wch: 12 }, // Rating
  ]

  // Generate buffer
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })
  return buffer
}

export function formatRatingLevel(level: Level): string {
  switch (level) {
    case 'EXCELLENT':
      return 'Excellent'
    case 'MODERATE':
      return 'Moderate'
    case 'LOW':
      return 'Low'
    default:
      return level
  }
}

export function formatTerm(term: Term): string {
  return term === 'MID' ? 'Mid-Year' : 'End-Year'
}