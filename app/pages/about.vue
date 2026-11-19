<script setup lang="ts">
import { profile } from '~/utils/profile'
import { seoConfig } from '~/utils/seo'

usePageSeo(() => ({ ...seoConfig.pages.about, path: '/about', type: 'profile' }))
</script>

<template>
  <div class="site-container page-shell">
    <header class="page-header">
      <h1>关于我</h1>
      <p>
        你好，我是阿木木，目前主要关注工程控制、智能算法和科研项目实践。
      </p>
      <p>
        这个博客主要用于记录我的学习过程、项目经验和技术踩坑。内容包括 Linux 使用记录、前端博客搭建、
        MoE 与强化学习学习笔记、点云处理、具身智能以及科研项目总结。
      </p>
      <p>
        我希望通过这个博客，把平时零散的学习内容整理成系统笔记，也方便以后回顾自己的成长路线。
      </p>
    </header>

    <section class="profile-card">
      <div class="profile-intro">
        <h2>{{ profile.name }}</h2>
        <p class="profile-tagline">{{ profile.tagline }}</p>
        <ContactList />
      </div>
    </section>

    <section class="about-grid">
      <article class="info-card">
        <h2>关注方向</h2>
        <ul>
          <li>MoE 与强化学习</li>
          <li>具身智能</li>
          <li>路径规划与控制算法</li>
          <li>点云处理与工程应用</li>
          <li>Linux / Fedora 使用记录</li>
          <li>科研论文阅读与项目总结</li>
        </ul>
      </article>

      <article class="info-card">
        <h2>博客目标</h2>
        <p>这个博客不是为了追求复杂功能，而是希望成为一个长期更新的个人技术档案库。</p>
      </article>
    </section>
  </div>
</template>
