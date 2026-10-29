<script setup lang="ts">
import { joinKeywords, resolveAbsoluteUrl, resolveImageUrl, seoConfig, useSiteUrl } from '~/utils/seo'
import { matchesContentSearch } from '~/utils/contentSearch'

const siteUrl = useSiteUrl()
const searchQuery = ref('')
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

const filteredWikiEntries = computed(() => {
  return (wikiEntries.value || []).filter((item) => {
    return matchesContentSearch(searchQuery.value, [
      item.title,
      item.description
    ])
  })
})

const recentWikiEntries = computed(() => filteredWikiEntries.value.slice(0, 3))

const clearFilters = () => {
  searchQuery.value = ''
}
</script>

<template>
  <div class="site-container page-shell">
    <header class="page-header">
      <p class="section-kicker">Wiki</p>
      <h1>Wiki</h1>
      <p>这里整理我在工程学习、科研项目和技术实践中反复用到的知识点。</p>
    </header>

    <section class="tag-filter-panel">
      <div class="tag-filter-head">
        <h2>搜索</h2>
        <p v-if="searchQuery">
          当前结果：{{ filteredWikiEntries.length }} 个条目
        </p>
        <p v-else>当前共 {{ wikiEntries?.length || 0 }} 个 Wiki 条目</p>
      </div>

      <div class="wiki-filter-stack">
        <div class="wiki-search-row">
          <input
            v-model="searchQuery"
            type="search"
            class="site-search-input wiki-search-input"
            placeholder="搜索标题或描述"
            autocomplete="off"
            aria-label="搜索 Wiki 条目"
          >
          <button type="button" class="ghost-btn wiki-clear-button" @click="clearFilters">
            清空
          </button>
        </div>
      </div>
    </section>

    <section v-if="recentWikiEntries.length" class="home-section">
      <div class="section-head">
        <div>
          <p class="section-kicker">最近更新</p>
          <h2>最近更新</h2>
        </div>
      </div>

      <div class="post-grid">
        <WikiCard v-for="item in recentWikiEntries" :key="item.slug" :item="item" />
      </div>
    </section>

    <section class="home-section">
      <div class="section-head">
        <div>
          <p class="section-kicker">全部条目</p>
          <h2>全部条目</h2>
        </div>
      </div>

      <div class="post-list">
        <WikiCard v-for="item in filteredWikiEntries" :key="item.slug" :item="item" />

        <article v-if="!filteredWikiEntries.length" class="post-card post-empty-state">
          <h2 class="post-card-title">没有找到相关知识条目</h2>
          <p class="post-card-excerpt">可以尝试更换关键词重新搜索。</p>
          <button type="button" class="post-card-link wiki-empty-action" @click="clearFilters">
            查看全部条目
          </button>
        </article>
      </div>
    </section>
  </div>
</template>
