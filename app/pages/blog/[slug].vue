<script setup lang="ts">
import { formatChineseDate } from '~/utils/date'
import { seoConfig } from '~/utils/seo'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))

const { data: post } = await useAsyncData(
  () => `post-${slug.value}`,
  async () => {
    return await queryCollection('posts')
      .where('slug', '=', slug.value)
      .first()
  }
)

const { data: adjacentPosts } = await usePostSummaries()

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: '文章不存在',
    fatal: true
  })
}

const articleDescription = computed(() => {
  return post.value?.description || post.value?.excerpt || seoConfig.defaultDescription
})

const articleKeywords = computed(() => {
  return post.value?.tags?.length ? post.value.tags : seoConfig.defaultKeywords
})

const currentPostIndex = computed(() => {
  return (adjacentPosts.value || []).findIndex((item) => item.slug === post.value?.slug)
})

const previousPost = computed(() => {
  const index = currentPostIndex.value
  if (index <= 0) return null
  return adjacentPosts.value?.[index - 1] || null
})

const nextPost = computed(() => {
  const index = currentPostIndex.value
  if (index < 0 || index >= (adjacentPosts.value?.length || 0) - 1) return null
  return adjacentPosts.value?.[index + 1] || null
})

useArticleSeo({
  title: () => post.value?.title || '文章',
  description: () => articleDescription.value,
  keywords: () => articleKeywords.value,
  path: () => `/blog/${slug.value}`
})
</script>

<template>
  <article v-if="post" class="site-container article-shell">
    <NuxtLink to="/blog" class="back-link">返回博客列表</NuxtLink>

    <header class="article-header">
      <p class="section-kicker">文章</p>
      <h1>{{ post.title }}</h1>
      <div class="article-meta">
        <time :datetime="post.date">{{ formatChineseDate(post.date) }}</time>
        <span>{{ post.author }}</span>
      </div>
      <p class="article-description">{{ post.description }}</p>
    </header>

    <ArticleContent :value="post" />

    <section class="article-pagination">
      <NuxtLink v-if="previousPost" :to="`/blog/${previousPost.slug}`" class="article-pagination-card is-prev">
        <span class="article-pagination-label">上一篇</span>
        <strong>{{ previousPost.title }}</strong>
      </NuxtLink>

      <NuxtLink to="/blog" class="article-pagination-center">
        返回全部文章
      </NuxtLink>

      <NuxtLink v-if="nextPost" :to="`/blog/${nextPost.slug}`" class="article-pagination-card is-next">
        <span class="article-pagination-label">下一篇</span>
        <strong>{{ nextPost.title }}</strong>
      </NuxtLink>
    </section>
  </article>
</template>
