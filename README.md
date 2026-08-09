# 阿木木的技术博客

一个使用 Nuxt 4 和 Nuxt Content 构建的静态个人技术博客，用于记录学习、工程实践与科研过程。

## 已有功能

- 首页、博客列表、文章详情、Wiki、关于页面和 404 页面
- Markdown 博客文章与 Wiki 知识条目
- 全站搜索、深色模式及主题偏好持久化
- 文章目录、阅读时间、上一篇/下一篇导航
- 代码块横向滚动、主题适配和复制按钮
- 响应式布局，支持桌面端与移动端
- favicon、基础 SEO、静态站点生成
- 纯前端实现，不需要后端或数据库

## 技术栈

- Nuxt 4
- Vue 3
- Nuxt Content 3
- TypeScript
- Markdown
- CSS Variables

## 本地运行

推荐使用 Node.js 22。使用 Anaconda 创建环境：

```bash
conda create -n nuxt-blog -c conda-forge nodejs=22 -y
conda activate nuxt-blog
npm install
npm run dev
```

浏览器访问终端显示的地址，通常是 <http://localhost:3000>。

## 内容位置

- 博客文章：`content/posts/*.md`
- Wiki 条目：`content/wiki/*.md`
- 页面：`app/pages/`
- 全局样式：`app/assets/css/app.css`
- 站点 SEO：`app/utils/seo.ts`

## 构建

```bash
npm run build
npm run generate
```

静态生成结果位于 `.output/public/`。

更完整的项目结构、内容模板、Git 工作流和换电脑开发步骤见 [DEVELOPMENT.md](./DEVELOPMENT.md)。
