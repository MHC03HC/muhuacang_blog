import type { SearchDocument } from '~/utils/fullTextSearch'

export const useFullTextIndex = () => {
  // Keep the immutable index across client-side route changes.
  const cached = useState<SearchDocument[] | null>('search-index', () => shallowRef(null))
  return useAsyncData('full-text-index', async () => {
    const documents = await $fetch<SearchDocument[]>('/search-index.json')
    cached.value = documents
    return documents
  }, { server: false, immediate: false, deep: false, getCachedData: () => cached.value ?? undefined })
}
