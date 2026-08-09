# 开发与维护手册

这份文档用于在新电脑上继续开发阿木木的技术博客，也作为后续添加文章、Wiki 和页面时的技术说明。

## 1. 项目架构

项目采用纯前端静态内容方案：

```text
Markdown 内容
    -> Nuxt Content 解析
    -> Vue/Nuxt 页面渲染
    -> Nuxt 服务端渲染或静态生成
```

网站没有业务后端和数据库。文章与 Wiki 都保存在 Git 仓库中，部署时可以生成静态 HTML、CSS 和 JavaScript 文件。

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
| `npm run preview` | 预览生产构建结果 |
| `git status` | 查看本地修改 |
| `git pull --rebase` | 拉取远端最新提交 |

## 4. 主要目录

```text
muhuacang_blog/
├── app/
│   ├── assets/css/app.css       # 全局样式和主题变量
│   ├── components/              # 页头、页脚、卡片等组件
│   ├── composables/useTheme.ts  # 深色模式逻辑
│   ├── pages/                   # Nuxt 页面与路由
│   ├── utils/                   # 阅读时间和 SEO 工具
│   └── app.vue                  # 应用入口
├── content/
│   ├── posts/                   # 博客 Markdown 文章
│   └── wiki/                    # Wiki Markdown 条目
├── public/                      # favicon、图片、robots.txt
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

即使当前 Wiki 页面没有显示分类和标签，也建议保留这些字段，便于以后恢复筛选或建立内容关系。

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
- 深色模式状态：`app/composables/useTheme.ts`
- 全局配色和代码块样式：`app/assets/css/app.css`
- 阅读时间算法：`app/utils/readingTime.ts`
- SEO 默认信息：`app/utils/seo.ts`
- 404 页面：`error.vue` 和 `public/404.html`

## 9. SEO 与域名

正式域名确定后，检查 `app/utils/seo.ts` 中的站点地址，并将示例地址改为真实的 HTTPS 域名。SEO 信息主要影响搜索引擎标题、摘要、分享预览和规范链接，不应改变页面排版。

上线前还应检查：

- 网站名称、description 和作者信息
- favicon 是否能通过 `/favicon.svg` 访问
- `public/robots.txt` 中的规则
- 域名的 DNS、HTTPS 和部署平台配置

## 10. 提交前检查

```bash
npm run build
npm run generate
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

## 13. 开发原则

- 内容优先使用 Markdown，不把文章正文写死在 Vue 页面中。
- 继续保持纯前端方案，确有账号、评论管理或私有数据需求时再考虑后端。
- 修改公共组件或全局 CSS 后，同时检查博客与 Wiki。
- 每次推送前至少运行一次 `npm run build`。
- 只提交源代码和内容，不提交依赖、缓存、构建产物或本机配置。
