<script setup lang="ts">
import { joinKeywords, seoConfig } from '~/utils/seo'
import { themeInitScript } from '~/utils/theme'

useHead({
  htmlAttrs: {
    lang: seoConfig.lang
  },
  titleTemplate: title => {
    if (!title || title === seoConfig.siteName) return seoConfig.siteName
    const suffix = ` - ${seoConfig.siteName}`
    return title.endsWith(suffix) ? title : title + suffix
  },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    { rel: 'alternate', type: 'application/rss+xml', title: `${seoConfig.siteName} RSS`, href: '/rss.xml' }
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
    { name: 'description', content: seoConfig.defaultDescription },
    { name: 'keywords', content: joinKeywords(seoConfig.defaultKeywords) }
  ]
})

useSeoMeta({
  applicationName: seoConfig.siteName,
  author: seoConfig.author,
  ogSiteName: seoConfig.defaultOgSiteName,
  ogLocale: 'zh_CN'
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
