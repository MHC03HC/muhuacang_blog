<script setup lang="ts">
import type { NuxtError } from '#app'
import type { PropType } from 'vue'
import { themeInitScript } from '~/utils/theme'

const props = defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true
  }
})

useHead({
  title: '页面走丢了',
  htmlAttrs: { lang: 'zh-CN' },
  script: [{ key: 'theme-init', innerHTML: themeInitScript, tagPosition: 'head' }],
  meta: [{ name: 'robots', content: 'noindex, follow' }]
})

const handleNavigation = async (path: string) => {
  await clearError({ redirect: path })
}

const statusCode = computed(() => props.error?.statusCode ?? 404)
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <SiteHeader />
    <main id="main-content" class="site-main" tabindex="-1">
      <section class="site-container error-shell">
        <div class="error-card">
          <p class="section-kicker">{{ statusCode }}</p>
          <h1>页面走丢了</h1>
          <p class="error-copy">你访问的页面不存在，可能是链接错误或内容已移动。</p>

          <div class="error-actions">
            <button type="button" class="primary-btn" @click="handleNavigation('/')">
              返回首页
            </button>
            <button type="button" class="ghost-btn" @click="handleNavigation('/blog')">
              返回文章列表
            </button>
            <button type="button" class="ghost-btn" @click="handleNavigation('/wiki')">
              浏览 Wiki
            </button>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>
