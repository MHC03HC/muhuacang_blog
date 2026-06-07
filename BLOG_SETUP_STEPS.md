# 博客搭建步骤

这份文档是给 `muhuacang_blog` 项目的第一阶段实施清单，目标是先搭建一个可以正常开发、预览、部署、绑定域名的个人博客。

## 1. 先确定第一版目标

第一版建议只做下面这些核心功能：

- 首页
- 博客列表页
- 博客详情页
- About 页面
- Markdown 写作
- 基础导航
- 静态部署
- 自定义域名绑定

第一版先不要急着做：

- 评论系统
- 登录后台
- 音乐播放器
- 多语言
- 访问统计
- 复杂动画
- Wiki 知识库

先把主干跑通，后面再扩展。

## 2. 域名购买后先做这几件事

买完域名以后，先不要急着立刻配所有 DNS。

先确认这些信息：

- 域名注册商是谁
- 你是否能进入 DNS 管理面板
- 你准备部署到哪里

推荐优先考虑这些部署平台：

1. Cloudflare Pages
2. Vercel
3. GitHub Pages

如果你希望后面省心一些，第一推荐是 Cloudflare Pages。

## 3. 先定技术方案

这个博客第一版建议直接使用：

- Nuxt 4
- @nuxt/content
- 原生 CSS
- Markdown 作为内容来源

原因：

- 和你参考的项目路线接近
- 不需要后端
- 对个人博客非常合适
- 后期扩展空间大

## 4. 初始化项目

在当前目录里执行：

```bash
npx nuxi@latest init .
npm install
npm install @nuxt/content
```

如果你后面还想做图片优化，也可以再安装：

```bash
npm install @nuxt/image
```

## 5. 先规划目录结构

建议第一版目录结构如下：

```text
app/
  app.vue
  components/
  pages/
    index.vue
    about.vue
    blog/
      index.vue
      [...slug].vue

content/
  posts/

public/
assets/
```

如果第一版暂时不做 Wiki，这样就够用了。

## 6. 第一批页面顺序

建议按这个顺序做：

1. 全局布局 `app.vue`
2. 首页 `app/pages/index.vue`
3. 博客列表页 `app/pages/blog/index.vue`
4. 博客详情页 `app/pages/blog/[...slug].vue`
5. About 页面 `app/pages/about.vue`
6. 准备 3 到 5 篇 Markdown 文章

这样你最快能看到完整闭环。

## 7. 文章内容怎么组织

建议先在 `content/posts/` 下写文章，例如：

```text
content/posts/hello-world.md
content/posts/my-first-project.md
content/posts/blog-plan.md
```

每篇文章建议先带最基础的 frontmatter：

```md
---
title: Hello World
description: 我的第一篇博客文章
date: 2026-06-04
---

正文内容写这里。
```

## 8. 本地开发

启动开发服务器：

```bash
npm run dev
```

然后在浏览器打开：

```text
http://localhost:3000
```

这个阶段的目标不是“做得很完整”，而是先确认：

- 页面能打开
- Markdown 能读取
- 博客列表能展示
- 博客详情能跳转

## 9. 第一版视觉设计建议

第一版建议风格尽量简单：

- 白底或浅色背景
- 清晰导航栏
- 首页有一句简介
- 博客列表重点展示标题、日期、摘要
- 文章页保证排版舒适

先把“内容可读”放在“视觉花样”前面。

## 10. 部署第一版

本地确认没问题以后，再部署。

### 如果使用 Cloudflare Pages

构建命令通常可以用：

```bash
npm run build
```

输出目录通常是：

```text
.output/public
```

如果后面改成显式静态生成，也可以根据 Nuxt 配置调整。

### 如果使用 GitHub Pages

可以后续再补 Pages 配置，但第一版我更建议你先用 Cloudflare Pages 或 Vercel。

## 11. 域名绑定时机

建议顺序是：

1. 先把项目写出来
2. 先成功部署到平台提供的默认域名
3. 再绑定你买的自定义域名

不要在项目还没跑起来时就卡在域名解析上。

## 12. 域名绑定时要做的事

等部署成功以后，再做下面这些：

- 在部署平台添加自定义域名
- 到域名注册商的 DNS 面板添加解析记录
- 等待证书签发和生效
- 测试 `www` 和根域名是否能正常访问

常见会涉及：

- `CNAME`
- `A`
- 有时还会用到平台要求的验证记录

具体记录值要看你最终选的部署平台。

## 13. 第一版完成标准

满足下面这些，就可以认为第一版已经成功：

- 本地可以正常运行
- 有首页
- 有 About 页面
- 有博客列表
- 有博客详情页
- 至少有 3 篇文章
- 已经部署上线
- 自定义域名能访问

## 14. 第二阶段再做什么

第一版完成后，第二阶段建议从这些里面选：

1. 深色模式
2. 搜索
3. 标签或分类
4. Wiki 知识库
5. 访问统计
6. RSS
7. SEO 优化

## 15. 最推荐的下一步

你现在最适合立刻做的是：

1. 初始化 Nuxt 项目
2. 安装 `@nuxt/content`
3. 建立首页、博客列表、博客详情、About
4. 写 3 篇测试文章
5. 本地跑通
6. 选择部署平台
7. 最后绑定域名

---

如果后面继续推进，这个项目下一份最值得补的文档是：

- `CONTENT_PLAN.md`：博客栏目和内容规划
- `DEPLOY_CHECKLIST.md`：部署与域名绑定清单
- `PHASE_1_TASKS.md`：第一阶段开发任务列表
