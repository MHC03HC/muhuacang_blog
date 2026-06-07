<script setup lang="ts">
import { joinKeywords, resolveAbsoluteUrl, resolveImageUrl, seoConfig } from '~/utils/seo'

const homeDescription = seoConfig.pages.home.description || seoConfig.defaultDescription
const homeKeywords = seoConfig.pages.home.keywords?.length
  ? seoConfig.pages.home.keywords
  : seoConfig.defaultKeywords
const homeImage = resolveImageUrl(seoConfig.defaultOgImage || seoConfig.defaultTwitterImage)
const canonical = resolveAbsoluteUrl('/')

useHead({
  link: canonical
    ? [{ rel: 'canonical', href: canonical }]
    : []
})

useSeoMeta({
  description: homeDescription,
  keywords: joinKeywords(homeKeywords),
  ogType: 'website',
  ogTitle: seoConfig.defaultOgTitle,
  ogDescription: homeDescription,
  twitterCard: homeImage ? 'summary_large_image' : 'summary',
  twitterTitle: seoConfig.defaultTwitterTitle,
  twitterDescription: homeDescription,
  ...(homeImage
    ? {
        ogImage: homeImage,
        twitterImage: homeImage
      }
    : {})
})

const { data: posts } = await useAsyncData('home-posts', () => {
  return queryCollection('posts')
    .all()
})

const latestPosts = computed(() => {
  return [...(posts.value || [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
})
</script>

<template>
  <div class="home-page">
    <section class="hero-section site-container">
      <h1>欢迎来到阿木木的菜鸟成长基地</h1>
      <p class="hero-summary">
        这里记录我的科研项目、算法笔记、论文阅读笔记和 Linux 折腾过程。
        目前主要关注 MoE、强化学习、点云处理和具身智能相关技术。
      </p>
      <p class="hero-summary hero-summary-secondary">一个记录学习、项目和踩坑过程的个人技术博客。</p>

      <div class="hero-actions">
        <NuxtLink to="/blog" class="primary-btn">进入博客</NuxtLink>
        <NuxtLink to="/about" class="ghost-btn">关于我</NuxtLink>
      </div>

      <div class="hero-avatar" aria-hidden="true">
        <img src="/ChatGPT%20Image%202026%E5%B9%B46%E6%9C%885%E6%97%A5%2018_37_02.png" alt="" />
      </div>
    </section>

    <section class="home-section site-container">
      <div class="section-head">
        <div>
          <p class="section-kicker">最近文章</p>
          <h2>最近更新</h2>
        </div>
        <NuxtLink to="/blog" class="section-link">查看全部</NuxtLink>
      </div>

      <div class="post-grid">
        <PostCard v-for="post in latestPosts" :key="post.slug" :post="post" />
      </div>
    </section>

    <section class="home-section site-container home-notes">
      <div class="section-head">
        <div>
          <p class="section-kicker">关注方向</p>
          <h2>当前关注方向</h2>
        </div>
      </div>

      <div class="feature-grid">
        <article class="feature-card">
          <h3>科研项目与算法学习</h3>
          <p>持续记录科研项目推进过程，以及算法学习中的理解、实现和复盘。</p>
        </article>
        <article class="feature-card">
          <h3>论文阅读与知识整理</h3>
          <p>把零散的论文阅读笔记和技术理解整理成更系统、更便于回顾的内容。</p>
        </article>
        <article class="feature-card">
          <h3>Linux 与工程踩坑记录</h3>
          <p>把 Linux、Fedora、开发环境和工程实践中的问题沉淀成真实可复用的经验。</p>
        </article>
      </div>
    </section>
  </div>
</template>
