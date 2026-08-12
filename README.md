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
- 博客与 Wiki 共用轻量内容摘要查询层
- GitHub Actions 自动构建与静态产物检查
- 纯前端实现，不需要后端或数据库

## 技术栈

- Nuxt 4
- Vue 3
- Nuxt Content 3
- TypeScript
- Markdown
- CSS Variables

## 架构概览

```text
Markdown 内容
    -> Nuxt Content 构建时解析
    -> 内容查询层生成轻量摘要
    -> Nuxt 页面预渲染
    -> .output/public 静态文件
```

文章详情按需读取完整 Markdown AST；首页、列表页和搜索页只使用标题、简介、日期、slug、内部标签和阅读时间等摘要字段。顶部搜索提交到 `/search`，在博客和 Wiki 摘要中进行浏览器端过滤，不调用接口，也不依赖数据库服务。

## 本地运行

推荐使用 Node.js 22。使用 Anaconda 创建环境：

```bash
conda create -n nuxt-blog -c conda-forge nodejs=22 -y
conda activate nuxt-blog
npm install
npm run dev
```

浏览器访问终端显示的地址，通常是 <http://localhost:3000>。

正式部署前复制 `.env.example` 为 `.env`，并填写 `NUXT_PUBLIC_SITE_URL`。该变量只用于生成静态页面的规范链接和分享地址，不会启动后端服务。

## 内容位置

- 博客文章：`content/posts/*.md`
- Wiki 条目：`content/wiki/*.md`
- 页面：`app/pages/`
- 主题变量：`app/assets/css/theme.css`
- 全局样式：`app/assets/css/app.css`
- 站点 SEO：`app/utils/seo.ts`
- 静态检查：`scripts/check-static-output.mjs`

## 构建

```bash
npm run build
npm run generate
npm run check:static
```

静态生成结果位于 `.output/public/`。

GitHub Actions 会自动执行安装、生产构建、静态生成和关键页面检查。正式部署仍然只需要发布 `.output/public/`，不需要运行 Node.js 服务。

更完整的项目结构、内容模板、Git 工作流和换电脑开发步骤见 [DEVELOPMENT.md](./DEVELOPMENT.md)。
