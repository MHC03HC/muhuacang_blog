<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const headerSearchQuery = ref('')
const { themeIcon, themeLabel, toggleTheme } = useTheme()

const navItems = [
  { to: '/', label: '首页' },
  { to: '/blog', label: '博客' },
  { to: '/wiki', label: 'Wiki' },
  { to: '/about', label: '关于' }
]

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
}

watch(
  () => route.query.q,
  (value) => {
    headerSearchQuery.value = typeof value === 'string' ? value : ''
  },
  { immediate: true }
)

const submitSearch = () => {
  const q = headerSearchQuery.value.trim()
  const nextQuery: Record<string, string> = {}

  if (q) {
    nextQuery.q = q
  }

  router.push({
    path: '/blog',
    query: nextQuery
  })
}
</script>

<template>
  <header class="site-header">
    <div class="site-container site-header-inner">
      <NuxtLink to="/" class="site-brand">
        <span class="site-brand-mark">穆</span>
        <span class="site-brand-copy">
          <strong>阿木木的技术博客</strong>
          <small>学习 · 工程 · 科研记录</small>
        </span>
      </NuxtLink>

      <div class="site-tools">
        <form class="site-search" role="search" @submit.prevent="submitSearch">
          <input
            v-model="headerSearchQuery"
            type="search"
            class="site-search-input"
            placeholder="搜索"
            autocomplete="off"
            aria-label="搜索博客文章"
          >
        </form>

        <button
          type="button"
          class="theme-toggle"
          :aria-label="themeLabel"
          :title="themeLabel"
          @click="toggleTheme"
        >
          {{ themeIcon }}
        </button>
      </div>

      <nav class="site-nav" aria-label="主导航">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="site-nav-link"
          :class="{ 'is-active': isActive(item.to) }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
