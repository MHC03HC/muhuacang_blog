import { joinKeywords, resolveAbsoluteUrl, resolveImageUrl, seoConfig, useSiteUrl } from '~/utils/seo'

export const useArticleSeo = (options: {
  title: () => string
  description: () => string
  keywords: () => string[]
  path: () => string
}) => {
  const siteUrl = useSiteUrl()
  const image = resolveImageUrl(seoConfig.defaultOgImage || seoConfig.defaultTwitterImage, siteUrl)
  useHead(() => {
    const canonical = resolveAbsoluteUrl(options.path(), siteUrl)
    return {
      title: options.title(),
      link: canonical ? [{ rel: 'canonical', href: canonical }] : []
    }
  })
  useSeoMeta({
    description: options.description,
    keywords: () => joinKeywords(options.keywords()),
    ogType: 'article',
    ogTitle: options.title,
    ogDescription: options.description,
    ogImage: image,
    twitterCard: image ? 'summary_large_image' : 'summary',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image
  })
}
