import { z } from '@nuxt/content'
import { maxProjectSlugLength, projectDefaults, projectSlugPattern, projectStatuses } from './app/utils/projects.ts'

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
const text = (max: number) => z.string().min(1).max(max).regex(/\S/, '字段不能只有空白字符')

export const projectSchema = z.object({
  title: text(120),
  slug: z.string().max(maxProjectSlugLength).regex(projectSlugPattern),
  description: text(500),
  status: z.enum(projectStatuses).default(projectDefaults.status),
  featured: z.boolean().default(projectDefaults.featured),
  order: z.number().int().min(0).max(99999).default(projectDefaults.order),
  startDate: date.optional(),
  updated: date.optional(),
  technologies: z.array(text(48)).max(16).default([]),
  github: z.string().max(240).optional(),
  cover: z.string().max(240).optional()
})
