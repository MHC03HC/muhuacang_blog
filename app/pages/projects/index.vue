<script setup lang="ts">
import { seoConfig } from '~/utils/seo'

usePageSeo(() => ({ ...seoConfig.pages.projects, path: '/projects', schema: 'CollectionPage' }))
const { data: projects } = await useProjectSummaries()
</script>

<template>
  <div class="site-container page-shell projects-page">
    <header class="page-header">
      <p class="section-kicker">Projects</p>
      <h1>科研与工程项目</h1>
      <p>{{ seoConfig.pages.projects.description }}</p>
    </header>
    <div class="project-list-head">
      <h2>项目列表</h2>
      <p>{{ projects?.length || 0 }} 个项目</p>
    </div>
    <div v-if="projects?.length" class="project-grid">
      <ProjectCard v-for="project in projects" :key="project.slug" :project="project" heading="h3" />
    </div>
    <p v-else class="empty-panel">暂无公开项目。</p>
  </div>
</template>
