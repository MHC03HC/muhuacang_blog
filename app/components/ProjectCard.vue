<script setup lang="ts">
import { formatChineseDate } from '~/utils/date'
import { projectPath, projectStatusLabels, type ProjectSummary } from '~/utils/projects'

defineProps<{ project: ProjectSummary, heading?: 'h2' | 'h3' }>()
</script>

<template>
  <article class="project-card">
    <img v-if="project.cover" class="project-card-cover" :src="project.cover" alt="" loading="lazy" decoding="async">
    <div class="project-card-body">
      <div>
        <div class="project-card-meta">
          <span class="project-status" :data-status="project.status">{{ projectStatusLabels[project.status] }}</span>
          <time v-if="project.updated" :datetime="project.updated">{{ formatChineseDate(project.updated) }}</time>
        </div>
        <component :is="heading || 'h2'" class="project-card-title">
          <NuxtLink :to="projectPath(project.slug)" no-prefetch>{{ project.title }}</NuxtLink>
        </component>
        <p>{{ project.description }}</p>
      </div>
      <div class="project-card-resources">
        <ul v-if="project.technologies.length" class="tech-list" aria-label="技术栈">
          <li v-for="(technology, index) in project.technologies" :key="index">{{ technology }}</li>
        </ul>
        <div class="project-card-links">
          <NuxtLink :to="projectPath(project.slug)" no-prefetch>查看项目</NuxtLink>
          <a v-if="project.github" :href="project.github" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>
      </div>
    </div>
  </article>
</template>
