<script setup lang="ts">
import type { ProjectSummary } from '~/utils/projects'

defineProps<{ projects: ProjectSummary[] }>()
</script>

<template>
  <section class="home-section site-container" aria-labelledby="home-projects">
    <div class="section-head">
      <div>
        <p class="section-kicker">Selected Projects</p>
        <h2 id="home-projects">科研与工程项目</h2>
      </div>
      <NuxtLink to="/projects" class="section-link">查看全部项目</NuxtLink>
    </div>
    <div v-if="projects.length" class="project-grid">
      <ProjectCard v-for="project in projects" :key="project.slug" :project="project" heading="h3" />
    </div>
    <p v-else class="empty-panel">暂无首页精选项目。</p>
  </section>
</template>
