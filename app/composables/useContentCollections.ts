import { formatReadingTime } from '~/utils/readingTime'

export type PostSummary = {
  title: string
  slug: string
  description: string
  excerpt?: string
  date: string
  author: string
  tags: string[]
  readingTimeText: string
}

export type WikiSummary = {
  title: string
  slug: string
  description: string
  category: string
  tags: string[]
  updated: string
}

const timestamp = (value: string) => {
  const result = new Date(value).getTime()
  return Number.isNaN(result) ? 0 : result
}

export const usePostSummaries = () => {
  return useAsyncData('post-summaries', async (): Promise<PostSummary[]> => {
    const posts = await queryCollection('posts').all()

    return posts
      .map((post) => ({
        title: post.title,
        slug: post.slug,
        description: post.description,
        excerpt: post.excerpt,
        date: post.date,
        author: post.author,
        tags: post.tags || [],
        readingTimeText: formatReadingTime(post.body || post.description)
      }))
      .sort((a, b) => timestamp(b.date) - timestamp(a.date))
  })
}

export const useWikiSummaries = () => {
  return useAsyncData('wiki-summaries', async (): Promise<WikiSummary[]> => {
    const entries = await queryCollection('wiki')
      .select('title', 'slug', 'description', 'category', 'tags', 'updated')
      .all()

    return entries
      .map((entry) => ({
        title: entry.title,
        slug: entry.slug,
        description: entry.description,
        category: entry.category || '',
        tags: entry.tags || [],
        updated: entry.updated
      }))
      .sort((a, b) => timestamp(b.updated) - timestamp(a.updated))
  })
}
