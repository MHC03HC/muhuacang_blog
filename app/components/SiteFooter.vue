<script setup lang="ts">
import { seoConfig } from '~/utils/seo'
</script>

<template>
  <footer class="site-footer">
    <div class="site-container site-footer-inner">
      <p>© {{ new Date().getFullYear() }} {{ seoConfig.siteName }} · 记录学习、工程与科研探索 · <a href="/rss.xml">RSS 订阅</a></p>
    </div>
  </footer>
</template>
