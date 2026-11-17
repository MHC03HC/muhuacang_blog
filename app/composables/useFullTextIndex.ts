import type { SearchDocument } from '~/utils/fullTextSearch'

export const useFullTextIndex = () => useAsyncData('full-text-index-v1', async (): Promise<SearchDocument[]> => {
  const options = { ignoredTags: ['style', 'script'], minHeading: 'h1' as const, maxHeading: 'h6' as const }
  const [postSections, wikiSections, posts, wiki] = await Promise.all([
    queryCollectionSearchSections('posts', options),
    queryCollectionSearchSections('wiki', options),
    queryCollection('posts').select('path', 'slug', 'title', 'description', 'date').all(),
    queryCollection('wiki').select('path', 'slug', 'title', 'description', 'updated').all()
  ])
  const makeSections = (path: string, sections: typeof postSections) => sections
    .filter(section => section.id.split('#')[0] === path)
    .map(section => ({
      heading: section.id.includes('#') ? section.title : '',
      anchor: section.id.includes('#') ? section.id.slice(section.id.indexOf('#') + 1) : '',
      content: section.content
    }))
  return [
    ...posts.map(post => ({
      kind: 'blog' as const, path: `/blog/${post.slug}`, title: post.title,
      description: post.description, date: post.date, sections: makeSections(post.path, postSections)
    })),
    ...wiki.map(entry => ({
      kind: 'wiki' as const, path: `/wiki/${entry.slug}`, title: entry.title,
      description: entry.description, date: entry.updated, sections: makeSections(entry.path, wikiSections)
    }))
  ]
})
