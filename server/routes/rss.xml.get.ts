import { queryCollection } from '@nuxt/content/server'
import { rssXml } from '../utils/feeds'

export default defineEventHandler(async event => {
  const posts = await queryCollection(event, 'posts').select('slug', 'title', 'description', 'date', 'seo').all()
  setResponseHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  return rssXml(posts, useRuntimeConfig(event).public.siteUrl)
})
