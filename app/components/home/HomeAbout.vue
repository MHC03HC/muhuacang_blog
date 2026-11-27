<script setup lang="ts">
import { profile } from '~/utils/profile'
</script>

<template>
  <section class="home-section site-container home-about" aria-labelledby="home-about">
    <div class="home-about-copy">
      <p class="section-kicker">About</p>
      <h2 id="home-about">关于阿木木</h2>
      <p>{{ profile.about }}</p>
      <NuxtLink to="/about" class="section-link">了解更多</NuxtLink>
    </div>
    <div class="home-about-tools">
      <h3>技术栈</h3>
      <ul class="tech-list">
        <li v-for="technology in profile.technologies" :key="technology">{{ technology }}</li>
      </ul>
    </div>
  </section>
</template>
