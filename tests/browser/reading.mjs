import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright-core'
import sirv from 'sirv'

const sampleTitle = '构建样例 & C++ <T> 与 </script>'
const sampleSlug = 'feed-integration-sample'
const root = fileURLToPath(new URL('../../', import.meta.url))
let workspace, browser, server, base, mermaidChunks, searchChunk

before(async () => {
  workspace = await mkdtemp(join(tmpdir(), 'blog-reader-'))
  for (const name of ['app', 'server', 'content', 'public', 'nuxt.config.ts', 'content.config.ts', 'package.json', 'tsconfig.json', '.nuxtrc']) {
    await cp(join(root, name), join(workspace, name), { recursive: true })
  }
  await cp(join(root, 'tests/fixtures/reading.md'), join(workspace, 'content/wiki/reading-fixture.md'))
  // This post exists only in the isolated build and exercises automatic feed discovery.
  await writeFile(join(workspace, 'content/posts/new-article.md'), `---
title: ${JSON.stringify(sampleTitle)}
slug: ${sampleSlug}
description: "XML & JSON-LD 测试"
date: 2026-06-08
---
正文
`)
  await symlink(join(root, 'node_modules'), join(workspace, 'node_modules'), 'dir')
  execFileSync(process.execPath, [join(root, 'node_modules/@nuxt/cli/bin/nuxi.mjs'), 'generate'], {
    cwd: workspace, stdio: 'inherit'
  })
  execFileSync(process.execPath, [join(root, 'scripts/check-static-output.mjs')], { cwd: workspace, stdio: 'inherit' })
  const { default: manifest } = await import(pathToFileURL(join(workspace, '.nuxt/dist/server/client.manifest.mjs')))
  mermaidChunks = new Set(Object.entries(manifest)
    .filter(([key]) => /renderMermaid|node_modules\/mermaid\//.test(key))
    .map(([, chunk]) => chunk.file))
  assert.ok(mermaidChunks.size > 1)
  searchChunk = manifest['pages/search.vue'].file
  server = createServer(sirv(join(workspace, '.output/public')))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${server.address().port}`
  browser = await chromium.launch({ channel: 'chrome', executablePath: process.env.CHROME_BIN })
})

after(async () => {
  await browser?.close()
  if (server) await new Promise(resolve => server.close(resolve))
  if (workspace) await rm(workspace, { recursive: true, force: true })
})

async function open(t, width, path) {
  const context = await browser.newContext({
    viewport: { width, height: 820 }, reducedMotion: 'reduce', colorScheme: 'light',
    permissions: ['clipboard-read', 'clipboard-write']
  })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', msg => {
    if (msg.type() === 'error' || /hydration/i.test(msg.text())) errors.push(msg.text())
  })
  const diagramRequests = []
  const paths = []
  page.on('request', req => {
    paths.push(new URL(req.url()).pathname)
    if (mermaidChunks.has(basename(new URL(req.url()).pathname))) diagramRequests.push(req.url())
  })
  t.after(async () => {
    await context.close()
    assert.deepEqual(errors, [])
  })
  await page.goto(base + path)
  await page.waitForLoadState('networkidle')
  return { page, diagramRequests, paths }
}

const assertFits = async page => {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
}

test('search index loads once on demand across queries and route changes', async t => {
  const { page, paths, diagramRequests } = await open(t, 1440, '/blog/blog-officially-starts')
  const indexRequests = () => paths.filter(path => path === '/search-index.json').length
  assert.ok(!paths.includes('/_nuxt/' + searchChunk))
  assert.equal(indexRequests(), 0)
  assert.deepEqual(diagramRequests, [])
  await page.locator('header a[href="/search"]').click()
  await page.locator('input[type=search]').waitFor()
  await page.waitForLoadState('networkidle')
  assert.equal(indexRequests(), 0)
  for (const q of ['指针', 'C++']) {
    await page.locator('input[type=search]').fill(q)
    await page.locator('button[type=submit]').click()
    await page.waitForURL(url => url.searchParams.get('q') === q)
    await page.getByRole('status').filter({ hasText: `“${q}”` }).waitFor()
    await page.locator('.search-result').first().waitFor()
    assert.equal(indexRequests(), 1)
  }
  await page.locator('.search-result h2 a').first().click()
  await page.getByRole('progressbar').waitFor()
  await page.goBack()
  await page.locator('.search-result').first().waitFor()
  assert.equal(indexRequests(), 1)
})

async function atAnchor(page, expectedHash) {
  await page.waitForFunction(expected => {
    if (expected && decodeURIComponent(location.hash) !== expected) return false
    const id = decodeURIComponent(location.hash.slice(1))
    const target = document.getElementById(id)
    const header = document.querySelector('.site-header')
    return target && Math.abs(target.getBoundingClientRect().top - header.getBoundingClientRect().bottom - 24) < 3
  }, expectedHash)
}

test('static HTTP serves the sitemap, updated feed and crawl rules without JavaScript', async () => {
  for (const [path, pattern] of [
    ['/rss.xml', /<rss version="2.0"/], ['/sitemap.xml', /<urlset /], ['/robots.txt', /Sitemap: https:\/\/www\.muhuacang\.cn\/sitemap\.xml/]
  ]) {
    const response = await fetch(base + path)
    assert.equal(response.status, 200, path)
    assert.match(response.headers.get('content-type'), path.endsWith('.xml') ? /xml/ : /text\/plain/)
    const body = await response.text()
    assert.match(body, pattern)
    if (path.endsWith('.xml')) {
      assert.ok(body.includes('https://www.muhuacang.cn/blog/' + sampleSlug))
      assert.ok(!body.includes('reading-fixture'))
    }
  }
})

for (const width of [360, 768, 1440]) {
  test(`${width}px · home RSS discovery and SEO across client navigation`, async t => {
    const { page } = await open(t, width, '/')
    assert.equal(await page.title(), '阿木木的技术博客')
    assert.equal(await page.locator('head link[type="application/rss+xml"]').getAttribute('href'), '/rss.xml')
    assert.equal(await page.getByRole('link', { name: 'RSS 订阅' }).getAttribute('href'), '/rss.xml')
    await assertFits(page)
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '博客' }).click()
    await page.locator(`a[href="/blog/${sampleSlug}"]`).first().click()
    await page.waitForFunction(name => document.title === name + ' - 阿木木的技术博客', sampleTitle)
    const schema = JSON.parse(await page.locator('head script[type="application/ld+json"]').textContent())
    assert.equal(schema.headline, sampleTitle)
    assert.equal(schema.url, await page.locator('head link[rel=canonical]').getAttribute('href'))
    await page.locator('header a[href="/search"]').click()
    await page.locator('meta[name=robots][content="noindex, follow"]').waitFor({ state: 'attached' })
    assert.equal(await page.locator('script[type="application/ld+json"]').count(), 0)
    assert.equal(await page.locator('head link[rel=canonical]').getAttribute('href'), 'https://www.muhuacang.cn/search')
  })

  test(`${width}px · long TOC, hash reload, body progress and keyboard return`, async t => {
    const { page, diagramRequests } = await open(t, width, '/wiki/cpp')
    const nav = page.getByRole('navigation', { name: '文章目录' })
    const openToc = async () => {
      if (width <= 900) await page.locator('.article-toc-toggle').click()
    }
    await openToc()
    const links = nav.locator('a')
    assert.ok(await links.count() > 40)
    const before = await page.evaluate(() => scrollY)
    await nav.evaluate(el => { el.scrollTop = 240 })
    assert.ok(await nav.evaluate(el => el.scrollTop > 0))
    assert.equal(await page.evaluate(() => scrollY), before)
    await nav.getByRole('button', { name: '全部折叠' }).click()
    assert.ok(await links.count() < 40)
    const folded = links.nth(1)
    const foldedHref = await folded.getAttribute('href')
    await folded.click()
    await atAnchor(page, foldedHref)
    if (width <= 900) await openToc()
    await nav.getByRole('button', { name: '全部展开' }).click()
    const link = links.nth(15)
    const href = await link.getAttribute('href')
    await link.click()
    await atAnchor(page, href)
    await page.waitForFunction(hash => document.querySelector('.article-toc-link.is-active')?.getAttribute('href') === hash, href)
    await page.reload()
    await atAnchor(page)
    const body = page.locator('.article-body')
    await body.evaluate(el => {
      const rect = el.getBoundingClientRect()
      const h = document.querySelector('.site-header').getBoundingClientRect().bottom
      scrollBy(0, rect.top - h + (rect.height - innerHeight + h) / 2)
    })
    await page.waitForFunction(() => Math.abs(Number(document.querySelector('[role=progressbar]').ariaValueNow) - 50) <= 1)
    // Growing the body without scrolling must invalidate progress.
    await body.evaluate(el => { el.style.paddingBottom = '5000px' })
    await page.waitForFunction(() => Number(document.querySelector('[role=progressbar]').ariaValueNow) < 49)
    await body.evaluate(el => {
      el.style.paddingBottom = ''
      scrollBy(0, el.getBoundingClientRect().bottom - innerHeight - 8)
    })
    await page.waitForFunction(() => document.querySelector('[role=progressbar]').ariaValueNow === '99')
    await page.evaluate(() => scrollBy(0, 9))
    await page.waitForFunction(() => document.querySelector('[role=progressbar]').ariaValueNow === '100')
    await page.getByRole('button', { name: '返回顶部' }).press('Enter')
    await page.waitForFunction(() => scrollY === 0 && !document.querySelector('.article-top-button'))
    await openToc()
    await links.nth(8).click()
    await atAnchor(page)
    assert.deepEqual(diagramRequests, [])
    await assertFits(page)
  })

  test(`${width}px · search and history across article and list routes`, async t => {
    const { page, diagramRequests } = await open(t, width, '/search?q=指针')
    assert.equal(await page.getByRole('progressbar').count(), 0)
    const hit = page.locator('.search-hit-heading[href*="/wiki/cpp#"]').first()
    await hit.click()
    await atAnchor(page)
    await page.goBack()
    await hit.waitFor()
    await page.goForward()
    await atAnchor(page)
    await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '博客' }).click()
    await page.waitForURL('**/blog')
    assert.equal(await page.getByRole('progressbar').count(), 0)
    await page.locator('a[href="/blog/blog-officially-starts"]').first().click()
    await page.getByRole('progressbar').waitFor()
    await assertFits(page)
    assert.deepEqual(diagramRequests, [])
  })

  test(`${width}px · MDC callouts, H1–H6, tab keyboard and exact clipboard text`, async t => {
    const { page } = await open(t, width, '/wiki/reading-fixture')
    const body = page.locator('.article-body')
    assert.match(await body.locator('.katex').first().evaluate(el => getComputedStyle(el).fontFamily), /KaTeX_Main/)
    const headings = await body.locator('h1,h2,h3,h4,h5,h6').evaluateAll(nodes => nodes.map(n => n.tagName))
    assert.deepEqual(headings, ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'])
    assert.equal(await page.locator('.article-toc-link').count(), 6)
    assert.equal(await body.getByRole('note').count(), 4)
    assert.equal(await body.getByRole('note', { name: '说明' }).locator('code').textContent(), 'main.cpp')
    assert.equal(await body.getByRole('note', { name: '技巧' }).locator('li a').getAttribute('href'), '#example')
    assert.equal(await body.locator('blockquote').count(), 1)
    if (width === 360) {
      assert.ok(await body.getByRole('tablist').evaluate(el => el.scrollWidth > el.clientWidth))
      for (const selector of ['table', '.katex-display', 'pre.language-bash']) {
        const wide = body.locator(selector).last()
        assert.ok(await wide.evaluate(el => el.scrollWidth > el.clientWidth), selector)
      }
      assert.ok(await body.locator('a[href="#example"]').last().evaluate(el => el.getClientRects().length > 1))
    }
    const tab = body.getByRole('tab', { name: 'Python' })
    await tab.press('End')
    await body.getByRole('tab', { name: 'Bash' }).press('ArrowLeft')
    const panel = body.getByRole('tabpanel')
    assert.equal(await panel.getAttribute('aria-labelledby'), await body.getByRole('tab', { name: 'C++' }).getAttribute('id'))
    assert.equal(await panel.locator('.code-filename').textContent(), 'main.cpp')
    await panel.getByRole('button').click()
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'int main() { return 0; }\n')
    await body.getByRole('tab', { name: 'C++' }).press('Home')
    assert.equal(await panel.locator('pre.shiki .line').textContent(), 'print("Python")\n')
    assert.ok(await body.locator('pre.language-js').isVisible())
    assert.ok(await body.locator('pre.language-json').filter({ hasText: '{"name": "example"}' }).isVisible())
    await page.getByRole('button', { name: '切换到深色模式' }).click()
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
    await assertFits(page)
  })

  test(`${width}px · Mermaid loading, three diagram types, theme and error fallback`, async t => {
    const { page, diagramRequests } = await open(t, width, '/wiki/gti')
    const diagrams = page.locator('.article-diagram')
    assert.equal(await diagrams.count(), 6)
    assert.deepEqual(diagramRequests, [])
    for (const diagram of await diagrams.all()) {
      await diagram.scrollIntoViewIfNeeded()
      const image = diagram.locator('img')
      await image.waitFor()
      await image.evaluate(el => el.decode())
    }
    assert.ok(diagramRequests.length)
    await assertFits(page)
    await page.goto(base + '/wiki/reading-fixture')
    for (const name of ['训练流程', '消息时序', '系统架构']) {
      const figure = page.locator('figure').filter({ has: page.getByText(name, { exact: true }) })
      await figure.scrollIntoViewIfNeeded()
      const img = figure.locator('img')
      await img.waitFor()
      await img.evaluate(el => el.decode())
      assert.ok(await img.evaluate(el => el.naturalWidth > 0))
    }
    const arch = page.getByRole('img', { name: '系统架构' })
    const initial = await arch.getAttribute('src')
    const requests = diagramRequests.length
    await page.getByRole('button', { name: '切换到深色模式' }).click()
    await page.waitForFunction(src => document.querySelector('img[alt="系统架构"]')?.src !== src, initial)
    assert.equal(await page.locator('figure .diagram-measure svg').count(), 0)
    assert.equal(diagramRequests.length, requests)
    await page.getByRole('button', { name: '切换到浅色模式' }).click()
    await page.waitForFunction(src => document.querySelector('img[alt="系统架构"]')?.src === src, initial)
    await arch.evaluate(img => img.decode())
    const failures = page.locator('.article-diagram').filter({ has: page.locator('pre') })
    await failures.last().scrollIntoViewIfNeeded()
    await page.waitForFunction(() => document.querySelectorAll('.article-diagram [role=status]').length === 2)
    assert.match(await failures.first().textContent(), /invalid diagram/)
    assert.match(await failures.last().textContent(), /不支持内嵌配置/)
    await assertFits(page)
  })
}
