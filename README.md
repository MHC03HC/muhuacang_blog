# 阿木木的技术博客

一个使用 Nuxt 4 和 Nuxt Content 构建的静态个人技术博客，用于记录学习、工程实践与科研过程。

## 已有功能

- 首页、博客列表、文章详情、Wiki、关于页面和 404 页面
- Markdown 博客文章与 Wiki 知识条目
- 全站搜索、深色模式及主题偏好持久化
- 左侧文章目录、移动端折叠目录、上一篇/下一篇导航
- 代码块横向滚动、主题适配和复制按钮
- 响应式布局，支持桌面端与移动端
- favicon、基础 SEO、静态站点生成
- 博客与 Wiki 共用轻量内容摘要查询层
- GitHub Actions 自动构建与静态产物检查
- 静态部署，不需要独立后端或数据库服务

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

文章详情按需读取完整 Markdown AST，首页和列表页使用轻量摘要。搜索页通过 Nuxt Content 的 `queryCollectionSearchSections()` 在静态生成时提取博客与 Wiki 的章节标题和正文，并结合文章元数据生成搜索索引，随静态页面数据加载到浏览器。

搜索采用文章级 AND 匹配，空格分隔的全部关键词可以分布在不同章节，忽略英文大小写并去除重复关键词。文章按标题完全匹配、标题命中词数、最佳章节标题命中词数、简介命中词数、最佳章节命中词数依次排序，同分按 URL 排序。章节只根据自身标题和正文匹配，按命中词数、章节标题完全匹配、标题命中词数和正文命中词数依次排序，同分保留原文顺序。每篇文章仅显示一个结果及最多三个去重的相关章节，摘要与高亮来自实际命中位置。支持中文、英文和 `C++`、`&&`、`||` 等字面字符。

不需要自建搜索接口或数据库服务。Nuxt Content 在客户端导航等场景下可能使用浏览器端 WASM SQLite 执行内容查询。阅读次数暂未接入统计服务。

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
- 样式入口：`app/assets/css/app.css`；基础、布局、公共组件、页面与正文分别位于同目录的 `base.css`、`layout.css`、`components.css`、`pages.css`、`content.css`。
- 站点 SEO：`app/utils/seo.ts`
- 静态检查：`scripts/check-static-output.mjs`

## 构建

```bash
npm ci
npm run build
npm run generate
npm run check:static
```

静态生成结果位于 `.output/public/`。

GitHub Actions 会自动执行安装、生产构建、静态生成和关键页面检查。正式部署仍然只需要发布 `.output/public/`，不需要运行 Node.js 服务。

仓库不保留独立单元测试文件，CI 持续运行构建与静态产物校验。修改搜索或目录逻辑后，需要重新执行针对性临时回归测试。
