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
  },
  hooks: {
    'build:manifest': (manifest) => {
      // Keep Mermaid strictly on-demand instead of prefetching its chunks on initial page load.
      const seen = new Set<string>()
      const disablePrefetch = (key: string) => {
        if (seen.has(key)) return
        seen.add(key)
        const entry = manifest[key]
        if (!entry) return
        entry.prefetch = false
        for (const dep of entry.imports || []) {
          if (!manifest[dep]?.isEntry) disablePrefetch(dep)
        }
        for (const dep of entry.dynamicImports || []) disablePrefetch(dep)
      }
      for (const key of Object.keys(manifest)) {
        if (/renderMermaid|node_modules\/mermaid\//.test(key)) disablePrefetch(key)
      }
    }
  }
})
