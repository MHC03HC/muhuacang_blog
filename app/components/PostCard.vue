<script setup lang="ts">
import { formatReadingTime } from '~/utils/readingTime'

interface PostCardItem {
  title: string
  slug: string
  date: string
  excerpt?: string
  description?: string
  body?: unknown
}

const props = defineProps<{
  post: PostCardItem
}>()

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const cardExcerpt = computed(() => props.post.excerpt || props.post.description || '')
const readingTimeText = computed(() => formatReadingTime(props.post.body || cardExcerpt.value || ''))
</script>

<template>
  <article class="post-card">
    <div class="post-card-meta">
      <time :datetime="post.date">{{ formatDate(post.date) }}</time>
      <span class="reading-time">{{ readingTimeText }}</span>
    </div>

    <h2 class="post-card-title">
      <NuxtLink :to="`/blog/${post.slug}`">{{ post.title }}</NuxtLink>
    </h2>

    <p class="post-card-excerpt">{{ cardExcerpt }}</p>

    <NuxtLink :to="`/blog/${post.slug}`" class="post-card-link">阅读全文</NuxtLink>
  </article>
</template>
