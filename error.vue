<script setup lang="ts">
import type { NuxtError } from '#app'
import type { PropType } from 'vue'

const props = defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true
  }
})

useHead({
  title: '页面走丢了'
})

const handleNavigation = async (path: string) => {
  await clearError({ redirect: path })
}

const statusCode = computed(() => props.error?.statusCode ?? 404)
</script>

<template>
  <div class="site-shell">
    <SiteHeader />
    <main class="site-main">
      <section class="site-container error-shell">
        <div class="error-card">
          <p class="section-kicker">{{ statusCode }}</p>
          <h1>页面走丢了</h1>
          <p class="error-copy">你访问的页面不存在，可能是链接错误或文章已移动。</p>

          <div class="error-actions">
            <button type="button" class="primary-btn" @click="handleNavigation('/')">
              返回首页
            </button>
            <button type="button" class="ghost-btn" @click="handleNavigation('/blog')">
              返回文章列表
            </button>
          </div>
        </div>
      </section>
    </main>
    <SiteFooter />
  </div>
</template>
