import { describe, it, expect } from 'vitest'
import { archiveSchema } from '../archive'

describe('archiveSchema', () => {
  it('validates correct archive data', () => {
    const validData = {
      title: 'Test Archive',
      content: 'Test content',
      category: 'essay' as const,
      tags: 'tag1, tag2, tag3',
    }

    const result = archiveSchema.safeParse(validData)
    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.title).toBe('Test Archive')
      expect(result.data.tags).toEqual(['tag1', 'tag2', 'tag3'])
    }
  })

  it('rejects empty title', () => {
    const invalidData = {
      title: '',
      content: 'Test content',
      category: 'essay',
    }

    const result = archiveSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects title longer than 200 characters', () => {
    const invalidData = {
      title: 'a'.repeat(201),
      content: 'Test content',
      category: 'essay',
    }

    const result = archiveSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects content longer than 50000 characters', () => {
    const invalidData = {
      title: 'Test',
      content: 'a'.repeat(50001),
      category: 'essay',
    }

    const result = archiveSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('accepts valid categories', () => {
    const categories = ['business', 'essay', 'movie', 'book', 'music', 'anime', 'comics', 'product', 'food', 'game', 'activity']

    categories.forEach((category) => {
      const validData = {
        title: 'Test',
        content: 'Test content',
        category,
      }

      const result = archiveSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  it('rejects invalid category', () => {
    const invalidData = {
      title: 'Test',
      content: 'Test content',
      category: 'invalid',
    }

    const result = archiveSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('transforms tags string to array', () => {
    const validData = {
      title: 'Test',
      content: 'Test content',
      category: 'essay' as const,
      tags: 'tag1, tag2, tag3',
    }

    const result = archiveSchema.safeParse(validData)
    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.tags).toEqual(['tag1', 'tag2', 'tag3'])
    }
  })

  it('handles empty tags', () => {
    const validData = {
      title: 'Test',
      content: 'Test content',
      category: 'essay' as const,
      tags: '',
    }

    const result = archiveSchema.safeParse(validData)
    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.tags).toEqual([])
    }
  })

  it('trims whitespace from tags', () => {
    const validData = {
      title: 'Test',
      content: 'Test content',
      category: 'essay' as const,
      tags: '  tag1  ,  tag2  ,  tag3  ',
    }

    const result = archiveSchema.safeParse(validData)
    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.tags).toEqual(['tag1', 'tag2', 'tag3'])
    }
  })
})
