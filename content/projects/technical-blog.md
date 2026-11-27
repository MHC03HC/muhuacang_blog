---
title: 个人技术博客与知识库
slug: technical-blog
description: 用静态生成维护个人技术档案，覆盖博客、Wiki、全文搜索与支持图表和公式的 Markdown 阅读体验。
status: ongoing
featured: true
order: 1
technologies:
  - Nuxt
  - Vue
  - TypeScript
  - Nuxt Content
github: https://github.com/MHC03HC/muhuacang_blog
---

## 项目背景

这座技术博客用来记录学习、工程实践和科研过程。博客用于记录实践与复盘，Wiki 用于整理可以反复查阅的技术知识。内容由 Markdown 文件维护。

## 技术架构

Nuxt Content 在构建期间解析 Markdown。首页和列表读取摘要字段，详情页按路由获取正文。Nuxt 将页面预渲染成静态文件，正式站点可以直接由静态托管服务提供访问。

## 阅读与搜索

阅读页支持目录、阅读进度、代码复制、Mermaid 图表和 KaTeX 公式。全文搜索按需加载静态索引，可以通过结果中的章节链接直接打开命中的段落。

## 工程维护

仓库通过 GitHub Actions 运行单元测试、类型检查、生产构建、静态产物检查和 Chrome 阅读场景测试。站点生成 Sitemap，RSS 用于订阅博客文章。
