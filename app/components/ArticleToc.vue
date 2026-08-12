<script setup lang="ts">
import type { ContentTocItem } from '~/composables/useContentEnhancements'

defineProps<{
  items: ContentTocItem[]
  activeHeadingId: string
}>()

const emit = defineEmits<{
  navigate: [id: string]
}>()
</script>

<template>
  <aside v-if="items.length >= 2" class="article-toc">
    <div class="article-toc-card">
      <p class="article-toc-title">文章目录</p>
      <nav aria-label="文章目录">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          class="article-toc-link"
          :class="[
            `is-${item.level}`,
            { 'is-active': activeHeadingId === item.id }
          ]"
          @click="emit('navigate', item.id)"
        >
          {{ item.text }}
        </button>
      </nav>
    </div>
  </aside>
</template>
