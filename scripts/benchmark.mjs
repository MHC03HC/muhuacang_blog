// npm run --silent benchmark -- [generated public directory]
// JSON lines go to stdout. The local server applies gzip to text assets.
import { chromium } from 'playwright-core'
import sirv from 'sirv'
import { createServer } from 'node:http'
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { cpus, release, tmpdir } from 'node:os'
import { gzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'

const input = resolve(process.argv[2] || '.output/public')
const dir = await mkdtemp(join(tmpdir(), 'blog-benchmark-'))
const emit = data => console.log(JSON.stringify(data))
const hash = text => createHash('sha256').update(text).digest('hex')
const routes = ['/', '/blog', '/blog/blog-officially-starts', '/wiki/cpp', '/wiki/gti', '/search']
let server, browser
try {
  await cp(input, dir, { recursive: true })
  const projectRoutes = new Set()
  let deployment = 0
  const scripts = []
  for (const file of await readdir(dir, { recursive: true, withFileTypes: true })) {
    if (!file.isFile()) continue
    const path = join(file.parentPath, file.name)
    const projectRoute = path.slice(dir.length).match(/^(\/projects(?:\/[^/]+)?)\/index\.html$/)?.[1]
    if (projectRoute) projectRoutes.add(projectRoute)
    const data = await readFile(path)
    deployment += data.length
    if (/\.js$/.test(path)) scripts.push([file.name, data.length])
    if (/\.(js|json|css|txt|html|svg|xml)$/.test(path)) await writeFile(path + '.gz', gzipSync(data))
  }
  server = createServer(sirv(dir, { gzip: true, setHeaders(res, path) {
    res.setHeader('Cache-Control', path.includes('_nuxt/') ? 'public, max-age=31536000' : 'max-age=0, must-revalidate')
  }, etag: true }))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const base = 'http://127.0.0.1:' + server.address().port
  browser = await chromium.launch({ channel: 'chrome', executablePath: process.env.CHROME_BIN })
  emit({ node: process.version, os: release(), cpu: cpus()[0].model, browser: browser.version(),
    throttling: 'none', viewportHeight: 900,
    deployment, deployJS: scripts.reduce((n, [, bytes]) => n + bytes, 0), largest: scripts.sort((a,b) => b[1]-a[1]).slice(0,6) })
  const projectList = projectRoutes.delete('/projects') ? ['/projects'] : []
  const projectSample = [...projectRoutes].sort().slice(0, 1)
  for (const width of [360, 768, 1440]) for (const route of [...routes, ...projectList, ...projectSample]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', colorScheme: 'light' })
    const page = await context.newPage()
    const cdp = await context.newCDPSession(page)
    await cdp.send('Performance.enable')
    await page.addInitScript(() => {
      window.vitals = { lcp: null, cls: 0, long: [] }
      let sessionStart, lastShift, sessionScore = 0
      for (const type of ['largest-contentful-paint', 'layout-shift', 'longtask']) {
        new PerformanceObserver(list => {
          for (const e of list.getEntries()) {
            if (type === 'largest-contentful-paint') window.vitals.lcp = e.startTime
            if (type === 'layout-shift' && !e.hadRecentInput) {
              if (sessionStart === undefined || e.startTime - lastShift >= 1000 || e.startTime - sessionStart >= 5000) {
                sessionStart = e.startTime
                sessionScore = 0
              }
              lastShift = e.startTime
              sessionScore += e.value
              window.vitals.cls = Math.max(window.vitals.cls, sessionScore)
            }
            if (type === 'longtask') window.vitals.long.push(e.duration)
          }
        }).observe({ type, buffered: true })
      }
    })
    for (const cache of ['cold', 'warm']) {
      await page.goto(base + route, { waitUntil: 'networkidle' })
      const metrics = await page.evaluate(() => {
        const entries = [...performance.getEntriesByType('navigation'), ...performance.getEntriesByType('resource')]
        const assets = {}
        for (const entry of entries) {
          const path = new URL(entry.name).pathname
          const ext = path.match(/\.(js|css|woff2?|png|webp|json)$/)?.[1] || 'other'
          const group = assets[ext] ||= { count: 0, wire: 0, encoded: 0, decoded: 0, network: 0 }
          group.count++
          group.wire += entry.transferSize
          group.encoded += entry.encodedBodySize
          group.decoded += entry.decodedBodySize
          if (entry.transferSize) group.network++
        }
        return { ...window.vitals, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
          assets, order: entries.map(e => new URL(e.name).pathname) }
      })
      const cpu = await cdp.send('Performance.getMetrics')
      emit({ width, route, cache, ...metrics, scriptMs: cpu.metrics.find(m => m.name === 'ScriptDuration').value * 1000 })
      if (cache !== 'cold') continue
      if (route === '/wiki/gti') {
        const figures = page.locator('.article-diagram')
        const before = await page.evaluate(() => performance.now())
        const drawings = []
        for (const fig of await figures.all()) {
          const start = await page.evaluate(() => performance.now())
          await fig.evaluate(el => el.scrollIntoView({ block: 'center' }))
          const img = fig.locator('img')
          await img.waitFor()
          drawings.push(await img.evaluate(async (el, start) => {
            await el.decode()
            return { ms: performance.now() - start, bytes: (await (await fetch(el.src)).blob()).size }
          }, start))
          if (drawings.length === 1) {
            const extra = await page.evaluate(t => performance.getEntriesByType('resource').filter(e => e.startTime >= t && /\.js$/.test(e.name))
              .map(e => [new URL(e.name).pathname, e.transferSize, e.decodedBodySize]), before)
            const themes = []
            for (const preference of ['dark', 'light']) {
              const old = await img.getAttribute('src')
              const start = await page.evaluate(preference => {
                const time = performance.now()
                const theme = document.querySelector('select[aria-label="外观主题"]')
                if (theme) {
                  theme.value = preference
                  theme.dispatchEvent(new Event('change', { bubbles: true }))
                } else {
                  document.querySelector('button[aria-label*="模式"]').click()
                }
                return time
              }, preference)
              await page.waitForFunction(old => document.querySelector('.article-diagram img')?.src !== old, old)
              themes.push(await img.evaluate(async (el, start) => { await el.decode(); return performance.now() - start }, start))
            }
            emit({ width, mermaidJS: extra, themes })
          }
        }
        emit({ width, drawings })
      }
      if (route.startsWith('/wiki/')) {
        const scroll = await page.evaluate(async () => {
          const rect = Element.prototype.getBoundingClientRect
          let reads = 0
          Element.prototype.getBoundingClientRect = function () { if (/^H[1-6]$/.test(this.tagName)) reads++; return rect.call(this) }
          const frames = []
          try {
            let last
            for (let i = 0; i <= 60; i++) {
              const now = await new Promise(requestAnimationFrame)
              if (last) frames.push(now-last)
              last = now
              scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * i / 60)
            }
          } finally { Element.prototype.getBoundingClientRect = rect }
          frames.sort((a,b) => a-b)
          return { median: frames[30], p95: frames[56], max: frames.at(-1), headingReads: reads }
        })
        emit({ route, width, scroll })
      }
      if (route === '/search') {
        for (const q of ['指针', 'C++', '&&', '||', 'Git', 'git', '指针 C++', 'Hello World', '无匹配xyz']) {
          await page.locator('input[type=search]').fill(q)
          const start = await page.evaluate(() => { const t = performance.now(); document.querySelector('form[role=search]').requestSubmit(); return t })
          await page.waitForFunction(q => document.querySelector('.page-header [role=status]')?.textContent.includes(`“${q}”`)
            && document.querySelector('.search-result,.post-empty-state'), q)
          const result = await page.evaluate(start => ({ ms: performance.now()-start, rows: Array.from(document.querySelectorAll('.search-result'),
            el => [el.textContent, Array.from(el.querySelectorAll('a'), a => a.getAttribute('href')), Array.from(el.querySelectorAll('mark'), m => m.textContent)]) }), start)
          emit({ width, q, ms: result.ms, digest: hash(JSON.stringify(result.rows)) })
        }
      }
      if (route === '/') {
        const start = await page.evaluate(() => { const t = performance.now(); document.querySelector('header a[href="/search"]').click(); return t })
        await page.locator('.search-page input').waitFor()
        emit({ width, navigateMs: await page.evaluate(t => performance.now()-t, start) })
      }
      // Leave the document before the warm navigation, without a hard reload.
      await page.goto('about:blank')
    }
    await context.close()
  }
} finally {
  await browser?.close()
  server?.close()
  await rm(dir, { recursive: true, force: true })
}
