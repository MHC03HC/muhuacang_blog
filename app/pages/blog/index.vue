<script setup lang="ts">
import { joinKeywords, resolveAbsoluteUrl, resolveImageUrl, seoConfig, useSiteUrl } from '~/utils/seo'
import { matchesContentSearch, normalizeSearchQuery } from '~/utils/contentSearch'

const siteUrl = useSiteUrl()
const route = useRoute()
const blogTitle = seoConfig.pages.blog.title || '博客文章'
const blogDescription = seoConfig.pages.blog.description || '这里汇总了我的科研项目记录、算法笔记、Linux 使用笔记与工程实践总结。'
const blogKeywords = seoConfig.pages.blog.keywords?.length
  ? seoConfig.pages.blog.keywords
  : seoConfig.defaultKeywords
const blogImage = resolveImageUrl(seoConfig.defaultOgImage || seoConfig.defaultTwitterImage, siteUrl)
const canonical = resolveAbsoluteUrl('/blog', siteUrl)

useHead({
  title: blogTitle,
  link: canonical
    ? [{ rel: 'canonical', href: canonical }]
    : []
})

useSeoMeta({
  description: blogDescription,
  keywords: joinKeywords(blogKeywords),
  ogType: 'website',
  ogTitle: blogTitle,
  ogDescription: blogDescription,
  twitterCard: blogImage ? 'summary_large_image' : 'summary',
  twitterTitle: blogTitle,
  twitterDescription: blogDescription,
  ...(blogImage
    ? {
        ogImage: blogImage,
        twitterImage: blogImage
      }
    : {})
})

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
      <p class="section-kicker">博客</p>
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
