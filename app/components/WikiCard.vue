<script setup lang="ts">
import type { WikiSummary } from '~/composables/useContentCollections'
import { formatChineseDate } from '~/utils/date'

defineProps<{
  item: WikiSummary
}>()
</script>

<template>
  <article class="post-card">
    <div class="post-card-meta">
      <time :datetime="item.updated">{{ formatChineseDate(item.updated) }}</time>
    </div>

    <h2 class="post-card-title">
      <NuxtLink :to="`/wiki/${item.slug}`">{{ item.title }}</NuxtLink>
    </h2>

    <p class="post-card-excerpt">{{ item.description }}</p>

    <NuxtLink :to="`/wiki/${item.slug}`" class="post-card-link">查看条目</NuxtLink>
  </article>
</template>
