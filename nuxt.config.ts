// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/content'],
  content: {
    renderer: {
      anchorLinks: false
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
