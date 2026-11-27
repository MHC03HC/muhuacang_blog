import { canonicalUrl, isIndexable, seoConfig, siteOrigin } from '../../app/utils/seo.ts'

type Entry = { slug: string, updated?: string, seo?: Record<string, unknown> }
type Post = Entry & { title: string, description: string, date: string }

const declaration = '<?xml version="1.0" encoding="UTF-8"?>'
const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }
const escapeXml = (value: string) => value.replace(/[&<>"']/g, character => entities[character]!)

function contentUrl(collection: 'blog' | 'wiki' | 'projects', slug: string, origin: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(slug)) throw new Error(`无效的文章 slug：${slug}`)
  return canonicalUrl(`/${collection}/${slug}`, origin)
}

function calendarDay(value: string, url: string) {
  const day = new Date(`${value}T00:00:00Z`)
  if (!Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== value) {
    throw new Error(`无效的内容日期：${url} ${value}`)
  }
  return day
}

export function sitemapXml(posts: Entry[], wiki: Entry[], origin = siteOrigin, projects: Entry[] = []) {
  const urls = new Map<string, string | undefined>()
  for (const path of ['/', '/blog', '/wiki', '/projects', '/about']) urls.set(canonicalUrl(path, origin), undefined)
  for (const [collection, entries] of [['blog', posts], ['wiki', wiki], ['projects', projects]] as const) {
    for (const entry of entries) {
      if (!isIndexable(entry.seo?.robots)) continue
      const url = contentUrl(collection, entry.slug, origin)
      if (!urls.has(url) || (entry.updated && entry.updated > (urls.get(url) || ''))) urls.set(url, entry.updated)
    }
  }
  const rows = [...urls.keys()].sort().map(url => {
    const modified = urls.get(url)
    if (modified) calendarDay(modified, url)
    return `  <url><loc>${escapeXml(url)}</loc>${modified ? `<lastmod>${escapeXml(modified)}</lastmod>` : ''}</url>`
  })
  return [declaration, '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...rows, '</urlset>', ''].join('\n')
}

export function rssXml(posts: Post[], origin = siteOrigin) {
  const home = canonicalUrl('/', origin)
  const seen = new Set<string>()
  const items: string[] = []
  const sorted = posts.filter(post => isIndexable(post.seo?.robots))
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
  for (const post of sorted) {
    const url = contentUrl('blog', post.slug, origin)
    if (seen.has(url)) continue
    seen.add(url)
    // Frontmatter is a calendar day. RSS requires a time, so encode the start of that day in UTC.
    const day = calendarDay(post.date, url)
    const link = escapeXml(url)
    items.push(`  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${link}</link>
    <guid isPermaLink="true">${link}</guid>
    <description>${escapeXml(post.description)}</description>
    <pubDate>${day.toUTCString()}</pubDate>
  </item>`)
  }
  return `${declaration}
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${escapeXml(seoConfig.siteName)}</title>
  <link>${escapeXml(home)}</link>
  <description>${escapeXml(seoConfig.defaultDescription)}</description>
  <language>${seoConfig.lang}</language>
  <atom:link href="${escapeXml(canonicalUrl('/rss.xml', origin))}" rel="self" type="application/rss+xml"/>
${items.join('\n')}
</channel>
</rss>
`
}
