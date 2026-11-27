<script setup lang="ts">
import { contactLinks } from '~/utils/profile'
import { seoConfig } from '~/utils/seo'
</script>

<template>
  <footer class="site-footer">
    <div class="site-container site-footer-inner">
      <div>
        <NuxtLink to="/" class="footer-brand">{{ seoConfig.siteName }}</NuxtLink>
        <p>© {{ new Date().getFullYear() }} 阿木木 · 学习、工程与科研记录</p>
      </div>
      <nav aria-label="页脚导航">
        <NuxtLink to="/about">关于</NuxtLink>
        <a href="/rss.xml">RSS 订阅</a>
        <a v-for="contact in contactLinks" :key="contact.key" :href="contact.href"
          :target="contact.external ? '_blank' : undefined" :rel="contact.external ? 'noopener noreferrer' : undefined">
          {{ contact.label }}
        </a>
      </nav>
    </div>
  </footer>
</template>
