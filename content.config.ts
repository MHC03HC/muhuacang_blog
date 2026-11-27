import { defineContentConfig, defineCollection, z } from '@nuxt/content'
import { projectSchema } from './project-schema'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式应为 YYYY-MM-DD')

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: 'page',
      source: 'posts/**/*.md',
      schema: z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().min(1),
        excerpt: z.string().optional(),
        date: isoDate,
        updated: isoDate.optional(),
        author: z.string().default('阿木木'),
        tags: z.array(z.string()).default([])
      })
    }),
    projects: defineCollection({
      type: 'page',
      source: 'projects/**/*.md',
      schema: projectSchema
    }),
    wiki: defineCollection({
      type: 'page',
      source: 'wiki/**/*.md',
      schema: z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().min(1),
        category: z.string().default(''),
        updated: isoDate,
        tags: z.array(z.string()).default([]),
        related: z.array(z.string()).default([])
      })
    })
  }
})
