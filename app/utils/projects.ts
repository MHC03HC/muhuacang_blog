export const projectStatuses = ['planned', 'ongoing', 'completed', 'archived'] as const
export type ProjectStatus = typeof projectStatuses[number]

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planned: '计划中',
  ongoing: '进行中',
  completed: '已完成',
  archived: '已归档'
}

export const projectDefaults = { status: 'ongoing', featured: false, order: 999 } as const
export const homeProjectLimit = 3

export type ProjectSummary = {
  title: string
  slug: string
  description: string
  status: ProjectStatus
  featured: boolean
  order: number
  updated?: string
  technologies: string[]
  github?: string
  cover?: string
}

export const projectPath = (slug: string) => `/projects/${slug}`

export const projectSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const maxProjectSlugLength = 80
export const isProjectSlug = (slug: string) => slug.length <= maxProjectSlugLength && projectSlugPattern.test(slug)

export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const day = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(day.getTime()) && day.toISOString().slice(0, 10) === value
}

export const isGitHubProjectUrl = (url: string) =>
  /^https:\/\/github\.com\/[a-z\d](?:[a-z\d-]{0,38})\/[a-z\d_.-]+\/?$/i.test(url)
  && !/\/\.{1,2}\/?$/.test(url)

export const isLocalCover = (path: string) =>
  /^\/images\/(?:[a-z\d_-]+\/)*[a-z\d_-][a-z\d_.-]*\.(?:webp|avif|png|jpe?g)$/i.test(path)

export function sortProjects<T extends Pick<ProjectSummary, 'order' | 'slug'>>(projects: readonly T[]) {
  return [...projects].sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug, 'en'))
}

export function selectHomeProjects(projects: readonly ProjectSummary[], limit = homeProjectLimit) {
  return sortProjects(projects.filter(project => project.featured)).slice(0, limit)
}

type ProjectSummarySource = Pick<ProjectSummary, 'title' | 'slug' | 'description'> & Partial<ProjectSummary>

export function projectSummary(project: ProjectSummarySource): ProjectSummary {
  const { title, slug, description, status, featured, order, updated, technologies, github, cover } = project
  return {
    title, slug, description,
    status: status ?? projectDefaults.status,
    featured: featured ?? projectDefaults.featured,
    order: order ?? projectDefaults.order,
    updated: updated || undefined,
    technologies: technologies ?? [],
    github: github || undefined,
    cover: cover || undefined
  }
}
