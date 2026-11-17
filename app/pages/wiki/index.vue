<script setup lang="ts">
import { joinKeywords, resolveAbsoluteUrl, resolveImageUrl, seoConfig, useSiteUrl } from '~/utils/seo'

const siteUrl = useSiteUrl()
const wikiTitle = 'Wiki'
const wikiDescription = '这里整理我在工程学习、科研项目和技术实践中反复用到的知识点。'
const wikiKeywords = ['Wiki', '知识库', '工程学习', '科研项目', '技术实践']
const wikiImage = resolveImageUrl(seoConfig.defaultOgImage || seoConfig.defaultTwitterImage, siteUrl)
const canonical = resolveAbsoluteUrl('/wiki', siteUrl)

const { data: wikiEntries } = await useWikiSummaries()

useHead({
  title: wikiTitle,
  link: canonical
    ? [{ rel: 'canonical', href: canonical }]
    : []
})

useSeoMeta({
  description: wikiDescription,
  keywords: joinKeywords(wikiKeywords),
  ogType: 'website',
  ogTitle: wikiTitle,
  ogDescription: wikiDescription,
  twitterCard: wikiImage ? 'summary_large_image' : 'summary',
  twitterTitle: wikiTitle,
  twitterDescription: wikiDescription,
  ...(wikiImage
    ? {
        ogImage: wikiImage,
        twitterImage: wikiImage
      }
    : {})
})

</script>

<template>
  <div class="site-container page-shell">
    <header class="page-header">
      <h1>Wiki知识库</h1>
      <p>这里整理我在工程学习、科研项目和技术实践中反复用到的知识点。</p>
    </header>

    <section class="home-section">
      <div class="post-list">
        <WikiCard v-for="item in wikiEntries" :key="item.slug" :item="item" />

        <article v-if="!wikiEntries?.length" class="post-card post-empty-state">
          <h2 class="post-card-title">暂无知识条目</h2>
          <p class="post-card-excerpt">新的知识条目会显示在这里。</p>
        </article>
      </div>
    </section>
  </div>
</template>
