<script setup lang="ts">
import type { PostSummary } from '~/composables/useContentCollections'
import { formatChineseDate } from '~/utils/date'

const props = defineProps<{
  post: PostSummary
}>()

const cardExcerpt = computed(() => props.post.excerpt || props.post.description || '')
</script>

<template>
  <article class="post-card">
    <div class="post-card-meta">
      <time :datetime="post.date">{{ formatChineseDate(post.date) }}</time>
      <span class="reading-time">{{ post.readingTimeText }}</span>
    </div>

    <h2 class="post-card-title">
      <NuxtLink :to="`/blog/${post.slug}`">{{ post.title }}</NuxtLink>
    </h2>

    <p class="post-card-excerpt">{{ cardExcerpt }}</p>

    <NuxtLink :to="`/blog/${post.slug}`" class="post-card-link">阅读全文</NuxtLink>
  </article>
</template>
