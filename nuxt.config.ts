// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/content'],
  css: ['~/assets/css/theme.css', '~/assets/css/app.css'],
  runtimeConfig: {
    public: {
      siteUrl: ''
    }
  }
})
