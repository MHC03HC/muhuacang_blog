<script setup lang="ts">
import { matchesContentSearch, normalizeSearchQuery } from '~/utils/contentSearch'

const route = useRoute()
const searchQuery = computed(() => normalizeSearchQuery(route.query.q))

const { data: posts } = await usePostSummaries()
const { data: wikiEntries } = await useWikiSummaries()

const filteredPosts = computed(() => {
  if (!searchQuery.value) return []

  return (posts.value || []).filter((post) => {
    return matchesContentSearch(searchQuery.value, [
      post.title,
      post.description,
      post.excerpt,
      post.tags
    ])
  })
})

const filteredWikiEntries = computed(() => {
  if (!searchQuery.value) return []

  return (wikiEntries.value || []).filter((entry) => {
    return matchesContentSearch(searchQuery.value, [
      entry.title,
      entry.description,
      entry.category,
      entry.tags
    ])
  })
})

const resultCount = computed(() => {
  return filteredPosts.value.length + filteredWikiEntries.value.length
})

useHead({
  title: '搜索'
})

useSeoMeta({
  description: '搜索阿木木的技术博客文章和 Wiki 知识条目。',
  robots: 'noindex, follow'
})
</script>

<template>
  <div class="site-container page-shell">
    <header class="page-header">
      <p class="section-kicker">搜索</p>
      <h1>搜索结果</h1>
      <p v-if="searchQuery">“{{ searchQuery }}”共找到 {{ resultCount }} 项内容。</p>
      <p v-else>请在顶部搜索框中输入关键词。</p>
    </header>

    <section v-if="filteredPosts.length" class="home-section">
      <div class="section-head">
        <div>
          <p class="section-kicker">博客</p>
          <h2>相关文章</h2>
        </div>
        <span>{{ filteredPosts.length }} 篇</span>
      </div>

      <div class="post-list">
        <PostCard v-for="post in filteredPosts" :key="post.slug" :post="post" />
      </div>
    </section>

    <section v-if="filteredWikiEntries.length" class="home-section">
      <div class="section-head">
        <div>
          <p class="section-kicker">Wiki</p>
          <h2>相关知识条目</h2>
        </div>
        <span>{{ filteredWikiEntries.length }} 条</span>
      </div>

      <div class="post-list">
        <WikiCard v-for="entry in filteredWikiEntries" :key="entry.slug" :item="entry" />
      </div>
    </section>

    <article v-if="searchQuery && !resultCount" class="post-card post-empty-state">
      <h2 class="post-card-title">没有找到相关内容</h2>
      <p class="post-card-excerpt">可以尝试缩短关键词，或者更换一个搜索词。</p>
    </article>
  </div>
</template>
