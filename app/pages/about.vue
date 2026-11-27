<script setup lang="ts">
import { profile } from '~/utils/profile'
import { seoConfig } from '~/utils/seo'

usePageSeo(() => ({ ...seoConfig.pages.about, path: '/about', type: 'profile' }))
</script>

<template>
  <div class="site-container page-shell">
    <header class="page-header">
      <p class="section-kicker">About</p>
      <h1>关于我</h1>
      <p>{{ profile.about }}</p>
    </header>

    <div class="about-layout">
      <section class="profile-card">
        <h2>{{ profile.name }}</h2>
        <p class="profile-tagline">{{ profile.tagline }}</p>
        <ContactList />
      </section>
      <div class="about-details">
        <section class="info-card">
          <h2>关注方向</h2>
          <ul class="interest-list">
            <li v-for="interest in profile.interests" :key="interest">{{ interest }}</li>
          </ul>
        </section>
        <section class="info-card">
          <h2>技术栈</h2>
          <ul class="tech-list">
            <li v-for="technology in profile.technologies" :key="technology">{{ technology }}</li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>
