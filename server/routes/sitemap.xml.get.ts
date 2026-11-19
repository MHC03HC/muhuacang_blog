import { queryCollection } from '@nuxt/content/server'
import { sitemapXml } from '../utils/feeds'

export default defineEventHandler(async event => {
  const [posts, wiki] = await Promise.all([
    queryCollection(event, 'posts').select('slug', 'updated', 'seo').all(),
    queryCollection(event, 'wiki').select('slug', 'updated', 'seo').all()
  ])
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return sitemapXml(posts, wiki, useRuntimeConfig(event).public.siteUrl)
})
