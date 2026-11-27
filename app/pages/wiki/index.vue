<script setup lang="ts">
import { seoConfig } from '~/utils/seo'

usePageSeo(() => ({ ...seoConfig.pages.wiki, path: '/wiki' }))

const { data: wikiEntries } = await useWikiSummaries()
</script>

<template>
  <div class="site-container page-shell wiki-page">
    <header class="page-header">
      <h1>Wiki 知识库</h1>
      <p>这里整理我在工程学习、科研项目和技术实践中反复用到的知识点。</p>
    </header>

    <section>
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
