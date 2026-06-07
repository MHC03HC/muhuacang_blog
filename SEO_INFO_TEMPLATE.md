# SEO 信息填写模板

这份文件用于整理博客当前需要的 SEO 基础信息。先填写，再接入项目。

---

## 1. 站点基础信息

- 站点中文名：阿木木的技术笔记
- 站点英文名（可选）：Amumu Notes
- 站点副标题：个人技术博客
- 站点一句话介绍：一个记录学习、项目和踩坑过程的个人技术博客。
- 站点正式域名：
- 站点作者名：阿木木
- 站点默认语言：zh-CN

示例：

```text
站点中文名：阿木木的技术笔记
站点英文名：Amumu Notes
站点副标题：个人技术博客
站点一句话介绍：一个记录学习、项目和踩坑过程的个人技术博客。
站点正式域名：https://example.com
站点作者名：阿木木
站点默认语言：zh-CN
```

---

## 2. 全站默认 SEO

这些内容会作为首页或兜底配置使用。

- 默认 title：阿木木的技术笔记
- 默认 description：记录科研项目、算法学习、Linux 折腾和工程实践的个人技术博客。
- 默认 keywords（用中文逗号分隔）：MoE, 强化学习, 点云处理, 具身智能, Linux, Fedora, 科研笔记
- 默认 og:title：阿木木的技术笔记
- 默认 og:description：记录科研项目、算法学习、Linux 折腾和工程实践的个人技术博客。
- 默认 og:image：
- 默认 og:site_name：阿木木的技术笔记
- 默认 twitter:title：阿木木的技术笔记
- 默认 twitter:description：
- 默认 twitter:image：记录科研项目、算法学习、Linux 折腾和工程实践的个人技术博客。

示例：

```text
默认 title：阿木木的技术笔记
默认 description：记录科研项目、算法学习、Linux 折腾和工程实践的个人技术博客。
默认 keywords：MoE, 强化学习, 点云处理, 具身智能, Linux, Fedora, 科研笔记
默认 og:title：阿木木的技术笔记
默认 og:description：记录科研项目、算法学习、Linux 折腾和工程实践的个人技术博客。
默认 og:image：https://example.com/og-cover.png
默认 og:site_name：阿木木的技术笔记
默认 twitter:title：阿木木的技术笔记
默认 twitter:description：记录科研项目、算法学习、Linux 折腾和工程实践的个人技术博客。
默认 twitter:image：https://example.com/og-cover.png
```

---

## 3. 首页 SEO

- 首页 title：
- 首页 description：
- 首页 keywords：
- 首页 og:title：
- 首页 og:description：
- 首页 og:image：

建议：

- title 不要太长
- description 尽量控制在一两句话内
- keywords 以你的长期主题为主

---

## 4. 博客列表页 SEO

- 博客页 title：
- 博客页 description：
- 博客页 keywords：
- 博客页 og:title：
- 博客页 og:description：

示例方向：

```text
博客页 title：博客文章
博客页 description：这里整理了我的科研项目记录、算法笔记、Linux 使用笔记与工程实践总结。
```

---

## 5. About 页面 SEO

- About 页 title：
- About 页 description：
- About 页 keywords：
- About 页 og:title：
- About 页 og:description：

---

## 6. 文章页 SEO 模板

后续每篇文章都建议从文章 frontmatter 自动生成这些信息。

- 文章 title：使用文章标题
- 文章 description：使用文章 description
- 文章 keywords：优先使用文章 tags
- 文章 og:title：使用文章标题
- 文章 og:description：使用文章 description
- 文章 og:image：如果文章有封面图则使用封面图，否则使用站点默认图

建议你后续每篇文章至少维护这些字段：

```yaml
title:
description:
tags:
```

---

## 7. 社交分享图信息

- 默认分享图文件名：
- 默认分享图尺寸：
- 默认分享图路径：
- 是否需要首页单独分享图：
- 是否需要文章统一分享图样式：

推荐：

- 尺寸：`1200 x 630`
- 格式：`png` 或 `jpg`

---

## 8. favicon 信息

- favicon 文件名：
- favicon 路径：
- 是否有苹果设备图标：
- 是否有浏览器标签页 SVG 图标：

常见文件：

```text
/favicon.ico
/favicon-32x32.png
/apple-touch-icon.png
```

---

## 9. 搜索引擎补充信息

- robots 是否允许抓取：
- 是否生成 sitemap：
- 是否需要 canonical：
- 是否需要站点备案信息展示（如果后续中国大陆部署）：

建议默认：

```text
robots：允许抓取
sitemap：生成
canonical：开启
```

---

## 10. 你的最终填写区

你可以直接按这个格式填写，我后面就按这里接入项目。

```text
[站点基础]
站点中文名：
站点英文名：
站点副标题：
站点一句话介绍：
站点正式域名：
站点作者名：
站点默认语言：

[全站默认 SEO]
默认 title：
默认 description：
默认 keywords：
默认 og:title：
默认 og:description：
默认 og:image：
默认 og:site_name：
默认 twitter:title：
默认 twitter:description：
默认 twitter:image：

[首页 SEO]
首页 title：
首页 description：
首页 keywords：
首页 og:title：
首页 og:description：
首页 og:image：

[博客页 SEO]
博客页 title：
博客页 description：
博客页 keywords：
博客页 og:title：
博客页 og:description：

[About 页 SEO]
About 页 title：
About 页 description：
About 页 keywords：
About 页 og:title：
About 页 og:description：

[分享图]
默认分享图文件名：
默认分享图路径：

[favicon]
favicon 文件名：
favicon 路径：
```
