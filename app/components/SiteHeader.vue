<script setup lang="ts">
import { seoConfig } from '~/utils/seo'
const route = useRoute()
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
</script>

<template>
  <header class="site-header">
    <div class="site-container site-header-inner">
      <NuxtLink to="/" class="site-brand">
        <span class="site-brand-mark">穆</span>
        <span class="site-brand-copy">
          <strong>{{ seoConfig.siteName }}</strong>
          <small>学习 · 工程 · 科研记录</small>
        </span>
      </NuxtLink>

      <div class="site-header-actions">
        <nav class="site-nav" aria-label="主导航">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="site-nav-link"
            :class="{ 'is-active': isActive(item.to) }"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <NuxtLink
          to="/search"
          class="theme-toggle"
          aria-label="搜索"
          title="搜索"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.8-3.8" />
          </svg>
        </NuxtLink>

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
    </div>
  </header>
</template>
