<script setup lang="ts">
import { profile } from '~/utils/profile'
import { seoConfig } from '~/utils/seo'
</script>

<template>
  <section class="hero-section site-container" aria-labelledby="home-title">
    <div class="hero-copy">
      <p class="section-kicker">{{ seoConfig.siteName }}</p>
      <h1 id="home-title">探索技术，<wbr>记录成长。</h1>
      <p class="hero-summary">{{ profile.introduction }}</p>
      <ul class="hero-interests" aria-label="关注方向">
        <li v-for="interest in profile.interests.slice(0, 4)" :key="interest">{{ interest }}</li>
      </ul>
      <div class="hero-actions">
        <NuxtLink to="/blog" class="primary-btn">进入博客</NuxtLink>
        <NuxtLink to="/wiki" class="ghost-btn">浏览 Wiki</NuxtLink>
      </div>
    </div>
    <div class="hero-portrait">
      <picture class="hero-avatar">
        <source media="(max-width: 600px)" srcset="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=">
        <img src="/images/avatar.webp" alt="阿木木的头像" width="512" height="512" decoding="async" fetchpriority="high">
      </picture>
    </div>
  </section>
</template>
