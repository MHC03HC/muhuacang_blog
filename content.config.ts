import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    posts: defineCollection({
      type: 'page',
      source: 'posts/**/*.md',
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        description: z.string(),
        excerpt: z.string(),
        date: z.string(),
        author: z.string().default('木花仓'),
        tags: z.array(z.string()).default([])
      })
    }),
    wiki: defineCollection({
      type: 'page',
      source: 'wiki/**/*.md',
      schema: z.object({
        title: z.string(),
        slug: z.string(),
        description: z.string(),
        category: z.string(),
        updated: z.string(),
        tags: z.array(z.string()).default([]),
        related: z.array(z.string()).default([])
      })
    })
  }
})
