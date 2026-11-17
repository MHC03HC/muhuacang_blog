// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/content'],
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
    '~/assets/css/app.css',
    'katex/dist/katex.min.css'
  ],
  runtimeConfig: {
    public: {
      siteUrl: 'https://www.muhuacang.cn'
    }
  }
})
