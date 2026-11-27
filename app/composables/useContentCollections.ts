import { seoConfig } from '~/utils/seo'
import { projectSummary, sortProjects, type ProjectSummary } from '~/utils/projects'

export type PostSummary = {
  title: string
  slug: string
  description: string
  excerpt?: string
  date: string
  author: string
  tags: string[]
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
    const posts = await queryCollection('posts')
      .select('title', 'slug', 'description', 'excerpt', 'date', 'author', 'tags')
      .all()

    return posts
      .map((post) => ({
        title: post.title,
        slug: post.slug,
        description: post.description,
        excerpt: post.excerpt,
        date: post.date,
        author: post.author || seoConfig.author,
        tags: post.tags || []
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

export const useProjectSummaries = () => {
  return useAsyncData('project-summaries', async (): Promise<ProjectSummary[]> => {
    const projects = await queryCollection('projects')
      .select('title', 'slug', 'description', 'status', 'featured', 'order', 'updated', 'technologies', 'github', 'cover')
      .all()

    return sortProjects(projects.map(projectSummary))
  })
}
