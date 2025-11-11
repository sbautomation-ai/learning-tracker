import { describe, it, expect } from 'vitest'
import { childSchema, subjectSchema, ratingSchema } from '@/lib/validation'

describe('Validation Schemas', () => {
  describe('childSchema', () => {
    it('should validate valid child data', () => {
      const result = childSchema.safeParse({ name: 'John Doe' })
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const result = childSchema.safeParse({ name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('subjectSchema', () => {
    it('should validate valid subject data', () => {
      const result = subjectSchema.safeParse({ name: 'Mathematics' })
      expect(result.success).toBe(true)
    })

    it('should reject empty name', () => {
      const result = subjectSchema.safeParse({ name: '' })
      expect(result.success).toBe(false)
    })
  })

  describe('ratingSchema', () => {
    it('should validate valid rating data', () => {
      const result = ratingSchema.safeParse({
        year: 2025,
        term: 'MID',
        level: 'EXCELLENT',
        childId: 'clxxx',
        subjectId: 'clyyy',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid year', () => {
      const result = ratingSchema.safeParse({
        year: 1999,
        term: 'MID',
        level: 'EXCELLENT',
        childId: 'clxxx',
        subjectId: 'clyyy',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid term', () => {
      const result = ratingSchema.saf