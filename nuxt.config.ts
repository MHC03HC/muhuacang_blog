import { siteOrigin } from './app/utils/seo'
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/content'],
  nitro: { prerender: { routes: ['/sitemap.xml', '/rss.xml', '/search-index.json'] } },
  content: {
    renderer: {
      anchorLinks: false
    },
    build: {
      markdown: {
        toc: { depth: 5, searchDepth: 6 },
        remarkPlugins: { 'remark-math': {} },
        rehypePlugins: { 'rehype-katex': {} },
        highlight: {
          theme: { default: 'github-light', dark: 'github-dark' },
          langs: ['js', 'jsx', 'json', 'ts', 'tsx', 'vue', 'css', 'html', 'bash', 'shell', 'md', 'mdc', 'yaml', 'cpp', 'c', 'python']
        }
      }
    }
  },
  css: [
    '@fontsource-variable/inter',
    '@fontsource-variable/jetbrains-mono',
    '~/assets/css/theme.css',
    '~/assets/css/app.css'
  ],
  runtimeConfig: {
    public: {
      siteUrl: siteOrigin
    }
  }
})
