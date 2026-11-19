<script setup lang="ts">
import { searchDocuments } from '~/utils/fullTextSearch'
import { formatChineseDate } from '~/utils/date'

const route = useRoute()
const router = useRouter()
const searchInput = ref('')
const searchQuery = ref('')
const { data: documents, error, status } = await useFullTextIndex()

const syncQuery = () => {
  const value = typeof route.query.q === 'string' ? route.query.q.trim().slice(0, 200) : ''
  searchInput.value = value
  searchQuery.value = value
}
// A generated /search page has no query at build time. Apply URL state after
// hydration so direct links and browser back/forward do not mismatch its HTML.
onMounted(syncQuery)
watch(() => route.query.q, syncQuery)

const submitSearch = async () => {
  const q = searchInput.value.trim().slice(0, 200)
  await router.push({ path: '/search', query: q ? { q } : {} })
  syncQuery()
}
const clearSearch = async () => {
  searchInput.value = ''
  await submitSearch()
}
const results = computed(() => searchDocuments(documents.value || [], searchQuery.value))

usePageSeo(() => ({
  path: '/search', title: '搜索', robots: 'noindex, follow',
  description: '全文搜索阿木木的博客和 Wiki，查找标题、简介、章节及正文。'
}))
</script>

<template>
  <div class="site-container page-shell search-page">
    <header class="page-header">
      <h1>搜索结果</h1>
      <p v-if="searchQuery && !error" role="status">“{{ searchQuery }}”共找到 {{ results.length }} 篇内容。</p>
      <p v-else>搜索博客与 Wiki 的标题、简介、章节和正文。</p>
    </header>

    <form class="search-page-form" role="search" @submit.prevent="submitSearch">
      <input
        v-model="searchInput" type="search" class="site-search-input"
        placeholder="搜索全文，如：指针、Hello World" autocomplete="off"
        aria-label="搜索博客和 Wiki 全文" aria-describedby="search-help" maxlength="200"
      >
      <button type="submit" class="primary-btn">搜索</button>
      <button v-if="searchQuery" type="button" class="ghost-btn" @click="clearSearch">清空</button>
    </form>
    <p id="search-help" class="search-help">多个关键词用空格分隔；点击命中章节可直接跳转。</p>

    <div v-if="error" class="post-card" role="alert">
      <p>搜索内容加载失败，请重试。</p>
      <!-- A failed client-side Content database request can remain cached.
           Reload the static page to recover its generated search payload. -->
      <button type="button" class="ghost-btn" @click="reloadNuxtApp({ force: true })">重新加载</button>
    </div>
    <p v-else-if="status === 'pending'" role="status">正在加载搜索内容…</p>
    <template v-else>
      <section v-if="results.length" class="home-section" aria-label="全文搜索结果">
        <div class="post-list">
          <article v-for="result in results" :key="result.document.path" class="post-card search-result">
            <div class="post-card-meta">
              <span>{{ result.document.kind === 'blog' ? '博客' : 'Wiki' }}</span>
              <time :datetime="result.document.date">{{ formatChineseDate(result.document.date) }}</time>
            </div>
            <h2 class="post-card-title">
              <NuxtLink :to="result.document.path"><SearchHighlight :text="result.document.title" :query="searchQuery" /></NuxtLink>
            </h2>
            <p v-if="!result.hits.length && result.summary" class="search-hit-context">
              <SearchHighlight :text="result.summary" :query="searchQuery" />
            </p>
            <ul v-if="result.hits.length" class="search-hits">
              <li v-for="hit in result.hits" :key="hit.href">
                <NuxtLink :to="hit.href" class="search-hit-heading">
                  <SearchHighlight :text="hit.heading" :query="searchQuery" />
                  <span v-if="hit.href.includes('#')" class="search-hit-action">定位章节 →</span>
                </NuxtLink>
                <p v-if="hit.snippet" class="search-hit-context"><SearchHighlight :text="hit.snippet" :query="searchQuery" /></p>
              </li>
            </ul>
            <NuxtLink :to="result.document.path" class="post-card-link">{{ result.document.kind === 'blog' ? '阅读全文' : '查看条目' }}</NuxtLink>
          </article>
        </div>
      </section>
      <article v-if="searchQuery && !results.length" class="post-card post-empty-state">
        <h2 class="post-card-title">没有找到相关内容</h2>
        <p class="post-card-excerpt">可以缩短关键词，或尝试更常见的表达。</p>
      </article>
    </template>
  </div>
</template>
