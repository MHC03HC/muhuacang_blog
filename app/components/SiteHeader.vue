<script setup lang="ts">
import { seoConfig } from '~/utils/seo'
import type { ThemePreference } from '~/utils/theme'
const route = useRoute()
const { preference, setPreference } = useTheme()

const navItems = [
  { to: '/', label: '首页' },
  { to: '/blog', label: '博客' },
  { to: '/wiki', label: 'Wiki' },
  { to: '/projects', label: '项目' },
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
        </span>
      </NuxtLink>

      <div class="site-header-actions">
        <span id="article-top-action" />
        <nav class="site-nav" aria-label="主导航">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :prefetch-on="item.to === '/projects' ? 'interaction' : 'visibility'"
            class="site-nav-link"
            :class="{ 'is-active': isActive(item.to) }"
            :aria-current="isActive(item.to) ? 'page' : undefined"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>

        <NuxtLink
          to="/search"
          prefetch-on="interaction"
          class="theme-toggle site-search-link"
          aria-label="搜索"
          title="搜索"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.8-3.8" />
          </svg>
        </NuxtLink>

        <div class="theme-toggle theme-control">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true">
            <path v-if="preference === 'dark'" d="M20.8 15a8.6 8.6 0 0 1-11.7-11.7A8.8 8.8 0 1 0 20.8 15Z" />
            <template v-else-if="preference === 'light'">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
            </template>
            <path v-else d="M3 4h18v13H3zM8 21h8m-4-4v4" />
          </svg>
          <select :value="preference" title="外观主题" aria-label="外观主题"
            @change="setPreference(($event.target as HTMLSelectElement).value as ThemePreference)">
            <option value="light">日间模式</option>
            <option value="dark">夜间模式</option>
            <option value="system">跟随系统</option>
          </select>
        </div>
      </div>
    </div>
  </header>
</template>
