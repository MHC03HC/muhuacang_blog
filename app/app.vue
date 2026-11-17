<script setup lang="ts">
import { joinKeywords, seoConfig } from '~/utils/seo'

const themeInitScript = `(function(){try{var key='amumu-theme';var stored=localStorage.getItem(key);var theme=(stored==='light'||stored==='dark')?stored:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){}})();`

useHead({
  htmlAttrs: {
    lang: seoConfig.lang
  },
  titleTemplate: (titleChunk) => titleChunk ? `${titleChunk} - ${seoConfig.siteName}` : seoConfig.siteName,
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
  ],
  script: [
    {
      key: 'theme-init',
      innerHTML: themeInitScript,
      tagPosition: 'head'
    }
  ],
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: seoConfig.defaultDescription }
  ]
})

useSeoMeta({
  applicationName: seoConfig.siteName,
  author: seoConfig.author,
  ogSiteName: seoConfig.defaultOgSiteName,
  ogLocale: 'zh_CN',
  keywords: joinKeywords(seoConfig.defaultKeywords)
})
</script>

<template>
  <div class="site-shell">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <SiteHeader />
    <main id="main-content" class="site-main" tabindex="-1">
      <NuxtPage />
    </main>
    <SiteFooter />
  </div>
</template>
