# 第一阶段优化交付记录

分支：`feat/phase-one-blog-polish`。本轮不发布、不推送、不合并到 main。

代码调整已完成，构建与静态验证通过；**360px、768px、1440px 的浏览器实测尚未完成**。浏览器工具返回 `The browser access host is unavailable`，无法取得页面截图或执行真实点击。以下明确区分静态检查与浏览器检查，不将两者混为一谈。

## 修改文件与目的

| 文件 | 修改目的 |
| --- | --- |
| `app/assets/css/app.css` | 保留样式入口与明确的导入顺序。 |
| `app/assets/css/base.css` | 基础样式、长文本换行、键盘焦点、跳转主要内容、减少动画偏好。 |
| `app/assets/css/layout.css` | 站点容器、导航、页脚及手机端明确的两行布局。 |
| `app/assets/css/components.css` | 共用按钮、卡片、网格、搜索输入、联系方式样式。 |
| `app/assets/css/pages.css` | Hero 两列布局、手机隐藏头像、关于和错误页面布局。 |
| `app/assets/css/content.css` | 正文宽度与间距、左侧目录、代码块、表格、公式及文章分页。 |
| `app/assets/css/theme.css` | 保留主题变量来源，修正浅色模式代码块底色和文字色。 |
| `app/app.vue`、`error.vue` | 增加跳到主要内容的链接和可聚焦目标。 |
| `app/components/SiteHeader.vue` | 共用站点名、导航当前页语义、搜索改为真实链接。 |
| `app/components/SiteFooter.vue` | 共用站点名与版权年份。 |
| `app/components/ArticleContent.vue` | 提取博客和 Wiki 共用的目录、正文渲染及阅读增强接线。 |
| `app/components/ArticleToc.vue` | 保留多级折叠；当前小节藏于折叠分支时，高亮可见父章节。 |
| `app/composables/useArticleSeo.ts` | 抽取详情页共用标题、描述、分享元数据与 canonical。 |
| `app/composables/useContentEnhancements.ts` | 目录数据交给工具层；按滚动位置高亮；动态避让导航；目录跳转保留 URL 锚点和键盘焦点；改进复制反馈及清理；代码、表格、公式可通过键盘聚焦滚动。 |
| `app/composables/useContentCollections.ts` | 修复摘要作者可能为空的类型问题，使用站点默认作者兜底。 |
| `app/composables/useTheme.ts` | 存储被禁用时仍可切换主题，持久化失败不阻断功能。 |
| `app/pages/index.vue` | Hero 文字容器参与网格布局；强化博客与 Wiki 入口；保留最新文章和技术方向。 |
| `app/pages/blog/[slug].vue`、`app/pages/wiki/[slug].vue` | 使用公共正文组件与 SEO composable；保留各自的查询和文章导航逻辑。 |
| `app/pages/search.vue` | 增加可见的提交按钮及结果状态语义，不改变搜索范围与机制。 |
| `app/utils/contentToc.ts` | 优先官方 `body.toc`，隔离 minimark 兼容逻辑；保留层级折叠工具。 |
| `app/utils/seo.ts` | 将站点名称集中为“阿木木的技术博客”。 |
| `content.config.ts`、`nuxt.config.ts` | 集合定义仍在内容配置；目录、数学公式与高亮移到当前版本支持的 `content.build.markdown`；补充 C++ 高亮语言。 |
| `public/404.html` | 静态错误页统一站点名称，尊重保存的主题及减少动画偏好，修正按钮和提示文字配色。独立 404 保留内联样式以便托管平台直接使用。 |
| `scripts/check-static-output.mjs` | 检查全部 Markdown 详情页面、本地图片、内部链接、锚点，并确认正文标题无自动链接。 |
| `tests/content-toc.test.mjs` | 覆盖官方目录、一级标题兼容、独立分支折叠、跳级标题、空内容。 |
| `package.json`、`.github/workflows/validate.yml` | 增加 `test:content` 命令，并纳入现有 CI。依赖声明与锁文件不变。 |
| `README.md`、`DEVELOPMENT.md` | 更新样式拆分位置、公共逻辑位置及验证命令。 |
| `PHASE_ONE_REPORT.md` | 记录交付范围、证据和验收缺口。 |

已删除无模板、脚本或 Markdown 使用的旧 Wiki 搜索/过滤、标签筛选、旧顶部搜索容器及页脚元数据样式。未删除 Markdown 正文，未修改文章与 Wiki 的公开 URL，未增加数据库、后端、CMS 或组件库。

## 布局和阅读体验

- 桌面 Hero 为文字与头像两列，文字可换行；手机隐藏头像，保留博客与 Wiki 按钮。
- 手机导航主动分两行，第二行包含四个导航项、搜索和主题控件；平板与桌面保留横排。
- 文章左侧目录宽 200px，正文最大宽 860px；900px 以下切换单列并默认折叠目录。
- 表格、代码、公式在各自区域内横向滚动；不通过隐藏整个页面的 overflow 掩盖溢出问题。
- 标题保留 ID，取消自动链接；目录可逐层折叠、全部展开/折叠，跳转时动态避让导航。
- 高频滚动通过 requestAnimationFrame 合并，按全部标题的位置确定当前章节，改善长代码块与反向滚动的高亮。
- 浅色代码块使用浅色底和对应高亮；深色通过 `data-theme` 对接 Shiki 颜色变量。

## 官方目录 API 评估

锁文件当前安装的 Nuxt Content 3.14.0 所使用的 MDC 目录生成器只采集 h2–h6，因此直接完全替换为 `body.toc` 会丢失现有 C++ 文档的 h1 章节。实施方式为优先展开官方目录；仅在 minimark 中有官方目录遗漏的标题时回退到完整标题序列。兼容逻辑集中在 `app/utils/contentToc.ts`，并有回归测试。无需重写现有 Markdown 标题层级。

## 验证结果

- `npm ci`：使用原锁文件安装成功。首次沙箱安装在 better-sqlite3 失败，使用临时缓存与允许的安装权限后恢复。
- `npm run build`：通过。
- `npm run generate`：通过。
- `npm run check:static`：通过，覆盖 16 个页面、2 个指定公共资源，以及这些页面引用的图片、内部链接与目录锚点。
- `npm run test:content`：4 项通过。
- `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.json`：通过。这是 TypeScript 检查，不等同于完整 Vue 模板类型检查。
- `git diff --check`：通过。
- C++ 产物检查：46 个标题与 46 个目录目标对应、10 个可折叠节点、36 个代码块；生成了 C++ 语法颜色变量。
- 独立公式解析检查：生成 KaTeX display AST；未在现有正文中插入测试公式。
- CSS 解析检查：拆分文件可解析。按主题变量计算的正文、次要文字、链接、主按钮、行内代码等主要纯色组合在浅色及深色均达到 4.5:1；该检查不覆盖所有语法高亮颜色或透明叠加后的实际像素。
- `content/` 与 `package-lock.json` 无差异。

## 尚未完成的实际页面验收

| 页面 | 静态页面、资源与链接 | 360px / 768px / 1440px 实际浏览器 |
| --- | --- | --- |
| 首页 `/` | 通过 | 待连接恢复后验证 |
| 博客列表 `/blog` | 通过 | 待连接恢复后验证 |
| 博客详情 `/blog/blog-officially-starts` | 通过 | 待连接恢复后验证 |
| Wiki 列表 `/wiki` | 通过 | 待连接恢复后验证 |
| C++ 长文 `/wiki/cpp` | 通过 | 待连接恢复后验证 |
| 搜索 `/search` | 通过 | 待连接恢复后验证 |
| 关于 `/about` | 通过 | 待连接恢复后验证 |
| 静态错误页 `/404.html` | 通过 | 待连接恢复后验证 |

恢复浏览器后，每种宽度检查页面级横向溢出、导航重叠、Hero 图文、目录展开/折叠与跳转、正反向滚动高亮、复制按钮与实际剪贴板、主题切换、键盘路径及内部路由。还需区分直接刷新与客户端导航，验证未知 URL 在腾讯云托管设置中是否返回自定义 404 及正确状态码。

## 风险和第二阶段候选

1. 浏览器验收是本阶段仍未满足的要求，不能仅凭构建成功宣称响应式与交互验收完成。
2. 安装报告现有锁定依赖共 45 项漏洞告警（6 low、12 moderate、21 high、6 critical）。本阶段未运行自动修复或升级；需要单独审查生产/开发依赖、实际暴露面和兼容性后规划升级。
3. 构建仍可能提示 Browserslist 数据陈旧及预加载插件 sourcemap 提示；不是本轮新增的业务构建失败，后续与依赖维护一起处理。
4. Clipboard API 需要浏览器支持及安全上下文（HTTPS 或 localhost）；不支持时提供失败提示，实际交互仍待实测。
5. 第二阶段可单独评估 Git 自动更新时间、依赖安全维护、sitemap/RSS/分享图片。全文搜索和 Wiki 分类需另行确认范围，本轮未实现。
