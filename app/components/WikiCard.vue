<script setup lang="ts">
interface WikiCardItem {
  title: string
  slug: string
  description: string
  updated: string
}

const props = defineProps<{
  item: WikiCardItem
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
</script>

<template>
  <article class="post-card">
    <div class="post-card-meta">
      <time :datetime="item.updated">{{ formatDate(item.updated) }}</time>
    </div>

    <h2 class="post-card-title">
      <NuxtLink :to="`/wiki/${item.slug}`">{{ item.title }}</NuxtLink>
    </h2>

    <p class="post-card-excerpt">{{ item.description }}</p>

    <NuxtLink :to="`/wiki/${item.slug}`" class="post-card-link">查看条目</NuxtLink>
  </article>
</template>
