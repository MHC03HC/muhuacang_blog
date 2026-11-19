import { readFile, readdir, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { parse } from 'yaml'
import { checkStaticSeo } from './check-static-seo.mjs'

const outputRoot = resolve('.output/public')
const pageChecks = [
  ['index.html', '欢迎来到阿木木的菜鸟成长基地'],
  ['blog/index.html', '博客文章'],
  ['blog/blog-officially-starts/index.html', '我的个人博客正式启用'],
  ['wiki/index.html', 'Wiki'],
  ['wiki/cpp/index.html', 'C++探索之旅'],
  ['about/index.html', '关于我'],
  ['search/index.html', '搜索结果'],
  ['404.html', '页面走丢了']
]

const failures = []
const articles = new Map()

// Cover every Markdown detail URL, not just the sample pages above.
const markdownFiles = async (directory) => {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) files.push(...await markdownFiles(path))
    else if (entry.name.endsWith('.md')) files.push(path)
  }
  return files
}
for (const [collection, route] of [['posts', 'blog'], ['wiki', 'wiki']]) {
  for (const file of await markdownFiles(resolve('content', collection))) {
    const markdown = await readFile(file, 'utf8')
    const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || ''
    const data = parse(frontmatter)
    const slug = data?.slug
    if (!slug || !/^[a-zA-Z0-9_-]+$/.test(slug)) {
      failures.push(`${file} 缺少可检查的 slug`)
      continue
    }
    const url = `/${route}/${slug}`
    if (articles.has(url)) failures.push(`${file} 的路由重复：${url}`)
    articles.set(url, data)
    const page = `${route}/${slug}/index.html`
    if (!pageChecks.some(([existing]) => existing === page)) pageChecks.push([page, 'article-body'])
  }
}

const decodeAttribute = (value) => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"')
const exists = async (path) => { try { return (await stat(path)).isFile() } catch { return false } }
const pageHtml = new Map()


for (const [relativePath, expectedText] of pageChecks) {
  const absolutePath = resolve(outputRoot, relativePath)

  try {
    const html = await readFile(absolutePath, 'utf8')
    pageHtml.set(relativePath, html)
    if (!html.includes(expectedText)) {
      failures.push(`${relativePath} 缺少预期内容：${expectedText}`)
    }
  } catch {
    failures.push(`${relativePath} 不存在或无法读取`)
  }
}

for (const relativePath of ['favicon.svg', 'images/avatar.webp']) {
  try {
    const file = await stat(resolve(outputRoot, relativePath))
    if (!file.isFile() || file.size === 0) {
      failures.push(`${relativePath} 不是有效文件`)
    }
  } catch {
    failures.push(`${relativePath} 不存在`)
  }
}

// Check local navigation, image resources, and TOC targets in the generated HTML.
for (const [page, html] of pageHtml) {
  const base = new URL(page.replace(/index\.html$/, ''), 'https://static-check.invalid/')
  for (const match of html.matchAll(/<(a|img)\b[^>]*?\b(?:href|src)="([^"]+)"/g)) {
    const [, tag, raw] = match
    const url = new URL(decodeAttribute(raw), base)
    if (url.origin !== base.origin) continue
    const path = decodeURIComponent(url.pathname).replace(/^\//, '')
    const target = tag === 'img' || /\.[a-z0-9]+$/i.test(path)
      ? path : `${path.replace(/\/$/, '')}${path ? '/' : ''}index.html`
    const targetPath = resolve(outputRoot, target)
    if (!targetPath.startsWith(`${outputRoot}/`) || !await exists(targetPath)) {
      failures.push(`${page} 的本地链接或图片不存在：${raw}`)
      continue
    }
    if (tag === 'a' && url.hash && target.endsWith('.html')) {
      const targetHtml = pageHtml.get(target) || await readFile(targetPath, 'utf8')
      const id = decodeURIComponent(url.hash.slice(1))
      if (!targetHtml.includes(`id="${id}"`)) failures.push(`${page} 的锚点不存在：${raw}`)
    }
  }
  // Body headings keep IDs for the TOC but should not contain auto-generated links.
  for (const heading of html.matchAll(/<h[1-6]\b[^>]*\bid="[^"]+"[^>]*>([\s\S]*?)<\/h[1-6]>/g)) {
    if (/<a\b/.test(heading[1])) failures.push(`${page} 的正文标题仍带链接`)
  }
}

if (failures.length) {
  console.error('静态站点检查失败：')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(`静态站点检查通过：${pageChecks.length} 个页面，2 个公共资源，以及内部链接、图片与目录锚点。`)

console.log(await checkStaticSeo(outputRoot, pageHtml, articles))
