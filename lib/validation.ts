import { z } from 'zod'

export const childSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
})

export const subjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
})

export const ratingSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  term: z.enum(['MID', 'END']),
  level: z.enum(['EXCELLENT', 'MODERATE', 'LOW']),
  childId: z.string().cuid(),
  subjectId: z.string().cuid(),
})

export const ratingUpdateSchema = z.object({
  id: z.string().cuid().optional(),
  year: z.number().int().min(2000).max(2100),
  term: z.enum(['MID', 'END']),
  level: z.enum(['EXCELLENT', 'MODERATE', 'LOW']),
  childId: z.string().cuid(),
  subjectId: z.string().cuid(),
})

export type ChildInput = z.infer<typeof childSchema>
export type SubjectInput = z.infer<typeof subjectSchema>
export type RatingInput = z.infer<typeof ratingSchema>
export type RatingUpdateInput = z.infer<typeof ratingUpdateSchema>