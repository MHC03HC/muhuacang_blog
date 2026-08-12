import { defineContentConfig, defineCollection, z } from '@nuxt/content'

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
        author: z.string().default('阿木木'),
        tags: z.array(z.string()).default([])
      })
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
