import { queryCollectionSearchSections } from '@nuxt/content/server'
import type { Section } from '@nuxt/content/server'
import type { SearchDocument } from '../../app/utils/fullTextSearch'

type IndexSection = Section & { slug: string, description: string }

function documents<T extends IndexSection>(sections: T[], kind: SearchDocument['kind'], date: (section: T) => string) {
  const result = new Map<string, SearchDocument>()
  for (const section of sections) {
    const hash = section.id.indexOf('#')
    const path = hash < 0 ? section.id : section.id.slice(0, hash)
    if (hash < 0) {
      result.set(path, { kind, path: `/${kind}/${section.slug}`, title: section.title,
        description: section.description, date: date(section), sections: [] })
    }
    result.get(path)!.sections.push({
      heading: hash < 0 ? '' : section.title, anchor: hash < 0 ? '' : section.id.slice(hash + 1), content: section.content
    })
  }
  return [...result.values()]
}

export default defineEventHandler(async event => {
  const options = { ignoredTags: ['style', 'script'], minHeading: 'h1' as const, maxHeading: 'h6' as const }
  const [posts, wiki] = await Promise.all([
    queryCollectionSearchSections(event, 'posts', { ...options, extraFields: ['slug', 'description', 'date'] }),
    queryCollectionSearchSections(event, 'wiki', { ...options, extraFields: ['slug', 'description', 'updated'] })
  ])
  setResponseHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  return JSON.stringify([...documents(posts, 'blog', s => s.date), ...documents(wiki, 'wiki', s => s.updated)])
})
