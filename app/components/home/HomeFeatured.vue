<script setup lang="ts">
import { formatChineseDate } from '~/utils/date'
import type { resolveFeatured } from '~/utils/featured'

defineProps<{ items: ReturnType<typeof resolveFeatured> }>()
</script>

<template>
  <section class="home-section site-container" aria-labelledby="home-featured">
    <div class="section-head">
      <div>
        <p class="section-kicker">Featured</p>
        <h2 id="home-featured">精选内容</h2>
      </div>
    </div>
    <div v-if="items.length" class="featured-grid" :class="{ 'with-extras': items.length > 1 }">
      <article v-for="item in items" :key="item.path" class="featured-card" :class="{ 'is-primary': item.primary }">
        <img v-if="item.cover" class="featured-cover" :src="item.cover" alt="" loading="lazy" decoding="async">
        <div class="featured-meta">
          <span>{{ item.kind === 'blog' ? '博客' : 'Wiki' }}</span>
          <time :datetime="item.date">{{ formatChineseDate(item.date) }}</time>
        </div>
        <h3><NuxtLink :to="item.path" prefetch-on="interaction">{{ item.title }}</NuxtLink></h3>
        <p>{{ item.description }}</p>
      </article>
    </div>
    <p v-else class="empty-panel">暂无精选内容。</p>
  </section>
</template>
