<script setup lang="ts">
import { featuredContents, resolveFeatured } from '~/utils/featured'
import { selectHomeProjects } from '~/utils/projects'
import { seoConfig } from '~/utils/seo'

usePageSeo(() => ({ ...seoConfig.pages.home, path: '/', schema: 'WebSite' }))

const covers = useRuntimeConfig().public.featuredCovers
const [{ data: posts }, { data: wiki }, { data: projects }] = await Promise.all([
  usePostSummaries(),
  useWikiSummaries(),
  useProjectSummaries()
])
const featured = computed(() => resolveFeatured(featuredContents, posts.value || [], wiki.value || [], covers,
  import.meta.server ? message => console.warn('[首页精选]', message) : undefined))
const homeProjects = computed(() => selectHomeProjects(projects.value || []))
</script>

<template>
  <div class="home-page">
    <HomeHero />
    <HomeFeatured :items="featured" />
    <HomeProjects :projects="homeProjects" />
    <HomeAbout />
  </div>
</template>
