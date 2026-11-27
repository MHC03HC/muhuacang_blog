<script setup lang="ts">
import { formatChineseDate } from '~/utils/date'
import { isProjectSlug, projectPath, projectStatusLabels, projectSummary } from '~/utils/projects'

const slug = String(useRoute().params.slug || '')
definePageMeta({ key: route => route.path })

const { data, error } = await useAsyncData(`project-${slug}`, async () => ({
  project: isProjectSlug(slug) ? await queryCollection('projects').where('slug', '=', slug).first() : null
}))
if (error.value) throw error.value
if (!data.value?.project) throw createError({ statusCode: 404, message: '项目不存在', fatal: true })
const project = data.value.project
const summary = projectSummary(project)

usePageSeo(() => ({
  title: project.title,
  description: project.description,
  keywords: project.technologies,
  path: projectPath(project.slug),
  type: 'article',
  schema: 'CreativeWork',
  robots: typeof project.seo?.robots === 'string' ? project.seo.robots : undefined,
  modified: project.updated,
  image: project.cover || undefined
}))
</script>

<template>
  <article class="site-container article-shell project-detail">
    <NuxtLink to="/projects" class="back-link">返回项目列表</NuxtLink>

    <header class="article-header">
      <div class="project-card-meta">
        <span class="section-kicker">项目</span>
        <span class="project-status" :data-status="summary.status">{{ projectStatusLabels[summary.status] }}</span>
      </div>
      <h1>{{ project.title }}</h1>
      <p class="article-description">{{ project.description }}</p>
      <div v-if="project.startDate || project.updated" class="article-meta">
        <span v-if="project.startDate">开始于 <time :datetime="project.startDate">{{ formatChineseDate(project.startDate) }}</time></span>
        <span v-if="project.updated">更新于 <time :datetime="project.updated">{{ formatChineseDate(project.updated) }}</time></span>
      </div>
      <ul v-if="summary.technologies.length" class="tech-list" aria-label="技术栈">
        <li v-for="(technology, index) in summary.technologies" :key="index">{{ technology }}</li>
      </ul>
      <a v-if="project.github" class="post-card-link" :href="project.github" target="_blank" rel="noopener noreferrer">GitHub 仓库</a>
      <img v-if="project.cover" class="project-detail-cover" :src="project.cover" alt="" decoding="async">
    </header>

    <ArticleContent :value="project" />
  </article>
</template>
