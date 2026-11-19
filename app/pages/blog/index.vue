<script setup lang="ts">
import { seoConfig } from '~/utils/seo'
import { matchesContentSearch, normalizeSearchQuery } from '~/utils/contentSearch'

const route = useRoute()

usePageSeo(() => ({ ...seoConfig.pages.blog, path: '/blog' }))

const { data: posts } = await usePostSummaries()

const normalizedSearchQuery = computed(() => {
  return normalizeSearchQuery(route.query.q)
})

const filteredPosts = computed(() => {
  return (posts.value || []).filter((post) => {
    return matchesContentSearch(normalizedSearchQuery.value, [
      post.title,
      post.description,
      post.excerpt,
      post.tags
    ])
  })
})
</script>

<template>
  <div class="site-container page-shell">
    <header class="page-header">
      <h1>博客文章</h1>
    </header>

    <section class="post-list">
      <PostCard v-for="post in filteredPosts" :key="post.slug" :post="post" />

      <article v-if="!filteredPosts.length" class="post-card post-empty-state">
        <h2 class="post-card-title">没有找到相关文章</h2>
        <p class="post-card-excerpt">没有找到相关文章，可以尝试更换搜索关键词。</p>
        <NuxtLink :to="{ path: '/blog' }" class="post-card-link">返回全部文章</NuxtLink>
      </article>
    </section>
  </div>
</template>
