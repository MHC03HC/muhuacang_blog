import type { PostSummary, WikiSummary } from '../composables/useContentCollections'
import { isLocalCover } from './projects.ts'

export type FeaturedSelection = {
  kind: 'blog' | 'wiki'
  slug: string
  primary?: boolean
  cover?: string
}

// Array order controls the display order. The first valid primary moves to the lead.
export const featuredContents: readonly FeaturedSelection[] = [
  { kind: 'blog', slug: 'blog-officially-starts', primary: true },
  { kind: 'wiki', slug: 'gti' },
  { kind: 'wiki', slug: 'cpp' }
]

type FeaturedItem = {
  kind: FeaturedSelection['kind']
  path: string
  title: string
  description: string
  date: string
  primary: boolean
  cover?: string
}

export function resolveFeatured(
  selections: readonly FeaturedSelection[],
  posts: readonly PostSummary[],
  wiki: readonly WikiSummary[],
  availableCovers: readonly string[] = [],
  warn: (message: string) => void = () => {}
): FeaturedItem[] {
  const postsBySlug = new Map(posts.map(post => [post.slug, post]))
  const wikiBySlug = new Map(wiki.map(entry => [entry.slug, entry]))
  const seen = new Set<string>()
  const items: FeaturedItem[] = []
  let primaryIndex = -1

  for (const selection of selections) {
    if (!selection || (selection.kind !== 'blog' && selection.kind !== 'wiki')
      || typeof selection.slug !== 'string' || !selection.slug
      || (selection.primary !== undefined && typeof selection.primary !== 'boolean')) {
      warn('精选配置需要合法的 kind、slug 和可选的布尔值 primary。')
      continue
    }

    const { kind, slug, primary, cover } = selection
    const path = `/${kind}/${slug}`
    const post = kind === 'blog' ? postsBySlug.get(slug) : undefined
    const entry = kind === 'wiki' ? wikiBySlug.get(slug) : undefined
    const content = post || entry
    if (!content || seen.has(path)) {
      warn(`精选内容不存在或重复：${path}`)
      continue
    }
    seen.add(path)

    if (primary) {
      if (primaryIndex === -1) primaryIndex = items.length
      else warn(`保留第一条主精选，${path} 作为辅助精选。`)
    }

    const validCover = typeof cover === 'string' && isLocalCover(cover) && availableCovers.includes(cover)
    if (cover !== undefined && !validCover) warn(`忽略无效或不存在的精选封面：${path}`)
    items.push({ kind, path, title: content.title, description: content.description,
      date: post?.date ?? entry?.updated ?? '', primary: false, cover: validCover ? cover : undefined })
  }

  if (items.length) {
    const [primary] = items.splice(Math.max(primaryIndex, 0), 1)
    if (primary) items.unshift({ ...primary, primary: true })
  }
  return items.slice(0, 3)
}
