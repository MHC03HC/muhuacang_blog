# 开发与维护手册

这份文档用于在新电脑上继续开发阿木木的技术博客，也作为后续添加文章、Wiki 和页面时的技术说明。

## 1. 项目架构

项目采用纯前端静态内容方案：

```text
Markdown 内容
    -> Nuxt Content 构建时解析
    -> 内容查询层生成轻量摘要
    -> Nuxt 页面预渲染
    -> .output/public 静态文件
```

网站没有业务后端和数据库。文章与 Wiki 都保存在 Git 仓库中，部署时可以生成静态 HTML、CSS 和 JavaScript 文件。

### 固定架构约束

- 默认保持纯前端静态生成，不增加业务后端或数据库。
- 内容继续使用 Markdown 和 Git 管理，不依赖在线 CMS。
- 搜索、主题切换、目录和代码复制等功能都在浏览器中完成。
- 腾讯云域名只用于 DNS 解析，静态网站可以部署到支持自定义域名的平台。
- 只有在明确改变这一约束后，才考虑账号、服务端评论或私有数据等后端能力。

### 内容数据流

- 首页、博客列表、Wiki 列表和全站搜索通过 `useContentCollections.ts` 获取轻量摘要，不携带完整 Markdown 正文。
- 博客与 Wiki 详情页根据 slug 查询完整内容，并由 Nuxt Content 渲染 Markdown AST。
- 搜索由 `contentSearch.ts` 在浏览器中匹配摘要，不请求搜索接口。
- 目录直接读取 Nuxt Content 生成的 `body.toc`，代码复制和阅读位置高亮由公共 composable 维护。

### 静态部署边界

`npm run generate` 会预渲染公开路由，最终只部署 `.output/public/`。访问者不需要 Node.js、数据库或常驻服务器；Node.js 仅用于本地开发和构建。腾讯云域名负责把域名指向所选静态托管平台，不负责运行博客程序。

## 2. 在另一台电脑上开始开发

### 2.1 克隆开发分支

当前最新内容位于 `agent/sync-latest-blog` 分支。在该分支合并到 `main` 前，使用：

```bash
git clone -b agent/sync-latest-blog https://github.com/MHC03HC/muhuacang_blog.git
cd muhuacang_blog
```

合并到 `main` 后，可以直接使用：

```bash
git clone https://github.com/MHC03HC/muhuacang_blog.git
cd muhuacang_blog
```

### 2.2 准备 Node.js 环境

推荐通过 Anaconda 安装 Node.js 22：

```bash
conda create -n nuxt-blog -c conda-forge nodejs=22 -y
conda activate nuxt-blog
node --version
npm --version
```

### 2.3 安装依赖并启动

```bash
npm install
npm run dev
```

终端出现 `Local: http://localhost:3000/` 后，用浏览器打开该地址。开发服务器必须保持运行。

## 3. 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 检查生产环境构建 |
| `npm run generate` | 生成静态网站 |
| `npm run check:static` | 检查生成后的关键页面和公共资源 |
| `npm run preview` | 预览生产构建结果 |
| `git status` | 查看本地修改 |
| `git pull --rebase` | 拉取远端最新提交 |

## 4. 主要目录

```text
muhuacang_blog/
├── app/
│   ├── assets/css/
│   │   ├── theme.css            # 浅色/深色主题变量
│   │   └── app.css              # 布局、组件和正文样式
│   ├── components/              # 页头、页脚、卡片等组件
│   ├── composables/             # 主题、内容查询和正文增强逻辑
│   ├── pages/                   # Nuxt 页面与路由
│   ├── utils/                   # 搜索、日期、阅读时间和 SEO 工具
│   └── app.vue                  # 应用入口
├── content/
│   ├── posts/                   # 博客 Markdown 文章
│   └── wiki/                    # Wiki Markdown 条目
├── public/                      # favicon、图片、robots.txt
├── scripts/                     # 静态产物检查脚本
├── .github/workflows/           # GitHub Actions 构建检查
├── .env.example                 # 公开环境变量示例
├── content.config.ts            # 内容集合字段定义
├── error.vue                    # Nuxt 错误/404 页面
├── nuxt.config.ts               # Nuxt 配置
└── package.json                 # 依赖和 npm 命令
```

Nuxt 根据 `app/pages` 中的文件自动生成路由：

| 文件 | 页面路径 |
| --- | --- |
| `app/pages/index.vue` | `/` |
| `app/pages/blog/index.vue` | `/blog` |
| `app/pages/blog/[slug].vue` | `/blog/:slug` |
| `app/pages/wiki/index.vue` | `/wiki` |
| `app/pages/wiki/[slug].vue` | `/wiki/:slug` |
| `app/pages/search.vue` | `/search?q=关键词` |
| `app/pages/about.vue` | `/about` |

## 5. 新增博客文章

在 `content/posts/` 新建 `.md` 文件。文件名建议使用小写英文和连字符，例如 `cpp-basic-syntax.md`。

~~~~markdown
---
title: C++ 基础语法记录
slug: cpp-basic-syntax
date: 2026-08-09
description: 记录 C++ 基础语法和常见问题。
tags:
  - C++
  - 编程基础
---

## 变量与类型

这里开始写正文。

### 示例代码

```cpp
#include <iostream>

int main() {
  std::cout << "Hello, world!" << std::endl;
  return 0;
}
```
~~~~

注意：上面的代码块标记是三个反引号 `` ` ``，不是三个单引号 `'`。

## 6. 新增 Wiki 条目

在 `content/wiki/` 新建 `.md` 文件：

```markdown
---
title: C++
slug: cpp
description: C++ 学习与工程实践笔记。
category: 编程语言
updated: 2026-08-09
tags:
  - C++
related:
  - fedora
---

## 初识 C++

正文写在这里。
```

`category`、`tags` 和 `related` 是可选的内部内容字段。当前 Wiki 页面保持简洁，不展示分类和标签，但搜索和内容关联仍可使用这些信息。

## 7. Markdown 常用写法

```markdown
# 一级标题
## 二级标题
### 三级标题

普通正文段落。

**粗体文字**
*斜体文字*
`行内代码`

- 无序列表
- 第二项

1. 有序列表
2. 第二项

[链接文字](https://example.com)
![图片说明](/images/example.png)

> 引用内容
```

文章目录会读取正文中的 `h2` 和 `h3`，因此正文通常从二级标题开始。标题不少于两个时才显示目录。

## 8. 功能维护位置

- 导航、全站搜索、主题按钮：`app/components/SiteHeader.vue`
- 博客文章卡片：`app/components/PostCard.vue`
- Wiki 卡片：`app/components/WikiCard.vue`
- 博客列表与筛选：`app/pages/blog/index.vue`
- 博客正文、目录、复制代码、前后篇：`app/pages/blog/[slug].vue`
- Wiki 正文、目录和复制代码：`app/pages/wiki/[slug].vue`
- 博客/Wiki 摘要查询：`app/composables/useContentCollections.ts`
- 公共目录和代码复制逻辑：`app/composables/useContentEnhancements.ts`
- 全站搜索结果：`app/pages/search.vue`
- 搜索匹配与摘要截断：`app/utils/contentSearch.ts`
- 日期格式化：`app/utils/date.ts`
- 深色模式状态：`app/composables/useTheme.ts`
- 主题变量：`app/assets/css/theme.css`
- 全局布局和代码块样式：`app/assets/css/app.css`
- 阅读时间算法：`app/utils/readingTime.ts`
- SEO 默认信息：`app/utils/seo.ts`
- 404 页面：`error.vue` 和 `public/404.html`
- 静态产物检查：`scripts/check-static-output.mjs`
- 持续集成检查：`.github/workflows/validate.yml`

### 列表与详情的数据边界

列表、首页和搜索只应查询卡片需要的摘要字段。新增详情页字段时，不要默认把完整 `body` 带入列表查询；只有正文渲染、目录或正文增强确实需要时，才在详情页读取完整内容。这样可以控制预渲染页面体积，也让文章数量增长后的搜索和列表保持轻量。

## 9. SEO 与域名

正式域名确定后，将 `.env.example` 复制为 `.env`，并把 `NUXT_PUBLIC_SITE_URL` 改为真实的 HTTPS 域名。该变量在构建静态页面时生成规范链接和分享地址，不会引入后端。SEO 信息主要影响搜索引擎标题、摘要、分享预览和规范链接，不应改变页面排版。

上线前还应检查：

- 网站名称、description 和作者信息
- favicon 是否能通过 `/favicon.svg` 访问
- `public/robots.txt` 中的规则
- 域名的 DNS、HTTPS 和部署平台配置

## 10. 提交前检查

```bash
npm run build
npm run generate
npm run check:static
git status
git diff --check
```

还需要手动检查：

- 首页、博客、Wiki、关于和不存在的页面
- 桌面端与手机宽度
- 浅色模式与深色模式
- 搜索、目录滚动和代码复制
- 所有文章及 Wiki 链接
- 浏览器控制台是否有错误

推送到 GitHub 后，`.github/workflows/validate.yml` 会再次执行安装、构建、静态生成和关键产物检查。工作流通过代表项目可以完成静态构建，但域名、HTTPS 和托管平台配置仍需在部署平台单独验证。

## 11. 两台电脑同步工作流

开始工作前：

```bash
git switch agent/sync-latest-blog
git pull --rebase
```

完成修改后：

```bash
git status
git add <本次修改的文件>
git commit -m "Describe the change"
git push
```

换到另一台电脑后，再执行 `git pull --rebase`。不要在两台电脑上同时修改同一个文件后再同步，否则容易产生合并冲突。

## 12. 常见问题

### 浏览器一直加载

确认 `npm run dev` 仍在终端运行，并使用终端实际显示的端口。若 3000 端口已被占用，Nuxt 会自动选择其他端口。

### 提示找不到依赖

```bash
conda activate nuxt-blog
npm install
```

### 修改 Markdown 后没有更新

先保存文件并刷新浏览器。仍未更新时，停止开发服务器后删除 Nuxt 缓存并重启：

```bash
rm -rf .nuxt
npm run dev
```

`.nuxt`、`.output` 和 `node_modules` 都是可重新生成的目录，不应提交到 GitHub。

### 新内容打开后进入 404

确认 Markdown 头部存在 `slug`，访问路径与该字段一致，并检查 `content.config.ts` 中的字段类型。

## 13. 后续核心架构路线

以下是内容规模继续增长后可以实施的改进，不是当前缺陷，也不需要后端：

- 统一以内容 `path` 作为详情页的唯一地址来源，减少文件名、slug 和路由之间的重复约定。
- Wiki 需要多级主题时，将详情路由升级为 `wiki/[...slug].vue`，支持嵌套目录。
- 文章数量明显增加后，用相邻内容查询替代详情页加载全部摘要来计算上一篇/下一篇。
- 在内容 schema 中补充 slug/path 唯一性检查，避免同名内容生成冲突路由。
- 明确维护预渲染路由清单，并让缺失详情页或无效内部链接直接使构建失败。

这些改进应在实际内容量或维护复杂度出现后再做，避免为了预期问题增加当前写作成本。

## 14. 开发原则

- 内容优先使用 Markdown，不把文章正文写死在 Vue 页面中。
- 继续保持纯前端方案，确有账号、评论管理或私有数据需求时再考虑后端。
- 修改公共组件或全局 CSS 后，同时检查博客与 Wiki。
- 每次推送前至少运行一次 `npm run build`。
- 列表和搜索保持摘要查询，详情页才读取完整正文。
- 可以在构建阶段完成的工作，不改成运行时服务。
- 只提交源代码和内容，不提交依赖、缓存、构建产物或本机配置。
