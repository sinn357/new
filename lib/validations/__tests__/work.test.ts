import { describe, it, expect } from 'vitest'
import { workSchema } from '../work'

describe('workSchema', () => {
  it('validates correct work data', () => {
    const validData = {
      title: 'Test Work',
      content: 'Test content',
      category: 'product' as const,
      techStack: 'React, TypeScript',
      status: 'completed' as const,
    }

    const result = workSchema.safeParse(validData)
    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.title).toBe('Test Work')
      expect(result.data.techStack).toEqual(['React', 'TypeScript'])
    }
  })

  it('rejects empty title', () => {
    const invalidData = {
      title: '',
      content: 'Test content',
      category: 'product',
    }

    const result = workSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects title longer than 200 characters', () => {
    const invalidData = {
      title: 'a'.repeat(201),
      content: 'Test content',
      category: 'product',
    }

    const result = workSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects content longer than 100000 characters', () => {
    const invalidData = {
      title: 'Test',
      content: 'a'.repeat(100001),
      category: 'product',
    }

    const result = workSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('rejects invalid category', () => {
    const invalidData = {
      title: 'Test',
      content: 'Test content',
      category: 'invalid',
    }

    const result = workSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('transforms techStack string to array', () => {
    const validData = {
      title: 'Test',
      content: 'Test content',
      category: 'product' as const,
      techStack: 'React, TypeScript, Next.js',
    }

    const result = workSchema.safeParse(validData)
    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.techStack).toEqual(['React', 'TypeScript', 'Next.js'])
    }
  })

  it('handles empty techStack', () => {
    const validData = {
      title: 'Test',
      content: 'Test content',
      category: 'product' as const,
      techStack: '',
    }

    const result = workSchema.safeParse(validData)
    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.techStack).toEqual([])
    }
  })

  it('validates URL fields', () => {
    const validData = {
      title: 'Test',
      content: 'Test content',
      category: 'product' as const,
      githubUrl: 'https://github.com/user/repo',
      demoUrl: 'https://demo.example.com',
    }

    const result = workSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects invalid URLs', () => {
    const invalidData = {
      title: 'Test',
      content: 'Test content',
      category: 'product' as const,
      githubUrl: 'not-a-url',
    }

    const result = workSchema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('applies default status', () => {
    const validData = {
      title: 'Test',
      content: 'Test content',
      category: 'product' as const,
    }

    const result = workSchema.safeParse(validData)
    expect(result.success).toBe(true)

    if (result.success) {
      expect(result.data.status).toBe('completed')
    }
  })
})
