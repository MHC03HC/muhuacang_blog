<script setup lang="ts">
import { seoConfig } from '~/utils/seo'
import { formatChineseDate } from '~/utils/date'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { data: entry } = await useAsyncData(
  () => `wiki-${slug.value}`,
  async () => {
    return await queryCollection('wiki')
      .where('slug', '=', slug.value)
      .first()
  }
)

const { data: allWikiEntries } = await useWikiSummaries()

if (!entry.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Wiki 条目不存在',
    fatal: true
  })
}

const entryDescription = computed(() => entry.value?.description || seoConfig.defaultDescription)
const entryKeywords = computed(() => {
  const values = [entry.value?.title, entry.value?.category, ...(entry.value?.tags || [])]
  return values.filter(Boolean) as string[]
})
useArticleSeo({
  title: () => entry.value?.title || 'Wiki',
  description: () => entryDescription.value,
  keywords: () => entryKeywords.value.length ? entryKeywords.value : seoConfig.defaultKeywords,
  path: () => `/wiki/${slug.value}`
})

const relatedEntries = computed(() => {
  const relatedSlugs = entry.value?.related || []
  if (!relatedSlugs.length) return []

  const relatedSet = new Set(relatedSlugs)
  return (allWikiEntries.value || []).filter((item) => relatedSet.has(item.slug))
})
</script>

<template>
  <article v-if="entry" class="site-container article-shell">
    <NuxtLink to="/wiki" class="back-link">返回 Wiki</NuxtLink>

    <header class="article-header">
      <p class="section-kicker">Wiki</p>
      <h1>{{ entry.title }}</h1>
      <div class="article-meta">
        <time :datetime="entry.updated">{{ formatChineseDate(entry.updated) }}</time>
      </div>
      <p class="article-description">{{ entry.description }}</p>
    </header>

    <ArticleContent :value="entry" />

    <section v-if="relatedEntries.length" class="home-section">
      <div class="section-head">
        <div>
          <p class="section-kicker">相关条目</p>
          <h2>相关条目</h2>
        </div>
      </div>

      <div class="post-grid">
        <WikiCard v-for="item in relatedEntries" :key="item.slug" :item="item" />
      </div>
    </section>

    <NuxtLink to="/wiki" class="back-link">返回 Wiki 首页</NuxtLink>
  </article>
</template>
