import { canonicalUrl, joinKeywords, seoConfig, siteOrigin, serializeJsonLd, structuredData, type PageSeo } from '~/utils/seo'

export function usePageSeo(getPage: () => PageSeo) {
  const origin = useRuntimeConfig().public.siteUrl
  const page = computed(getPage)
  const url = computed(() => canonicalUrl(page.value.path, origin))
  const imageUrl = computed(() => {
    const image = page.value.image || seoConfig.defaultOgImage || seoConfig.defaultTwitterImage
    return image ? new URL(image, origin || siteOrigin).href : undefined
  })

  useHead(() => {
    const schema = structuredData(page.value, url.value)
    return {
      title: page.value.title,
      link: [{ rel: 'canonical', href: url.value }],
      meta: [{ name: 'keywords', content: joinKeywords(page.value.keywords || seoConfig.defaultKeywords) }],
      script: schema ? [{ key: 'page-schema', type: 'application/ld+json', innerHTML: serializeJsonLd(schema) }] : []
    }
  })
  useSeoMeta({
    description: () => page.value.description,
    author: () => page.value.author || seoConfig.author,
    robots: () => page.value.robots,
    ogType: () => page.value.type || 'website',
    ogUrl: () => url.value,
    ogTitle: () => page.value.title,
    ogDescription: () => page.value.description,
    ogImage: () => imageUrl.value,
    twitterCard: () => imageUrl.value ? 'summary_large_image' : 'summary',
    twitterTitle: () => page.value.title,
    twitterDescription: () => page.value.description,
    twitterImage: () => imageUrl.value
  })
}
