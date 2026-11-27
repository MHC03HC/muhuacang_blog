import assert from 'node:assert/strict'
import test from 'node:test'
import { DOMParser } from '@xmldom/xmldom'
import { canonicalUrl, isIndexable, serializeJsonLd, siteOrigin, structuredData } from '../app/utils/seo.ts'
import { rssXml, sitemapXml } from '../server/utils/feeds.ts'

const readXml = xml => new DOMParser({ onError: (_, message) => { throw Error(message) } }).parseFromString(xml, 'application/xml')
const values = (doc, name) => Array.from(doc.getElementsByTagName(name), node => node.textContent)
const special = '中文 & C++ <T> "引号" 与单引号 \''
const post = { slug: 'gti', title: special, description: special, date: '2024-02-29' }

test('canonical uses the production origin, root slash and stable article paths', () => {
  assert.equal(canonicalUrl('/'), siteOrigin + '/')
  assert.equal(canonicalUrl('/wiki//gti/?q=git#intro', siteOrigin + '/'), siteOrigin + '/wiki/gti')
  assert.throws(() => canonicalUrl('//example.test/blog'))
  assert.throws(() => canonicalUrl('/blog', 'http://localhost:3000'))
})

test('robots exclusion recognizes individual directives independent of case and whitespace', () => {
  for (const value of ['noindex, follow', 'FOLLOW NOINDEX', 'none']) assert.equal(isIndexable(value), false)
  for (const value of [undefined, 'index, follow', 'nofollow']) assert.equal(isIndexable(value), true)
})

test('sitemap combines the public pages and collection-specific slugs exactly once', () => {
  const doc = readXml(sitemapXml([post, post], [post, { slug: 'sample', seo: { robots: 'noindex' } }]))
  assert.deepEqual(values(doc, 'loc'), ['/', '/about', '/blog', '/blog/gti', '/projects', '/wiki', '/wiki/gti'].map(path => siteOrigin + path))
  assert.deepEqual(values(doc, 'lastmod'), [])
})

test('sitemap records only sourced modification dates and retains the latest for a duplicate', () => {
  const entry = { slug: 'cpp', updated: '2026-11-17' }
  const doc = readXml(sitemapXml([{ ...post, updated: '2026-11-18' }], [entry, { ...entry, updated: '2026-10-01' }]))
  assert.deepEqual(values(doc, 'lastmod'), ['2026-11-18', '2026-11-17'])
  assert.throws(() => sitemapXml([], [{ slug: '../search' }]))
  assert.throws(() => sitemapXml([], [{ slug: 'cpp', updated: '2026-02-30' }]), /无效的内容日期/)
})

test('RSS uses descending publication days, stable permalink GUIDs and explicit GMT dates', () => {
  const newer = { ...post, slug: 'next', date: '2024-03-01' }
  const doc = readXml(rssXml([post, newer, newer, { ...post, slug: 'sample', seo: { robots: 'none' } }]))
  const urls = ['next', 'gti'].map(slug => siteOrigin + '/blog/' + slug)
  assert.deepEqual(values(doc, 'guid'), urls)
  assert.deepEqual(values(doc, 'link'), [siteOrigin + '/', ...urls])
  assert.deepEqual(values(doc, 'pubDate'), ['Fri, 01 Mar 2024 00:00:00 GMT', 'Thu, 29 Feb 2024 00:00:00 GMT'])
})

test('RSS round-trips XML punctuation and Chinese text without optional article fields', () => {
  const xml = rssXml([post])
  for (const entity of ['&lt;', '&gt;', '&amp;', '&apos;', '&quot;']) assert.ok(xml.includes(entity))
  const item = readXml(xml).getElementsByTagName('item')[0]
  assert.deepEqual(values(item, 'title'), [special])
  assert.deepEqual(values(item, 'description'), [special])
})

test('an empty feed remains valid and an impossible publication day cannot be silently rolled forward', () => {
  assert.equal(values(readXml(rssXml([])), 'item').length, 0)
  assert.throws(() => rssXml([{ ...post, date: '2025-02-29' }]), /无效的内容日期/)
})

test('BlogPosting and TechArticle keep distinct date semantics and real author metadata', () => {
  const page = { title: '示例', description: '技术笔记', path: '/blog/gti', schema: 'BlogPosting', author: '作者', published: post.date }
  const url = canonicalUrl(page.path)
  const article = structuredData(page, url)
  assert.equal(article['@context'], 'https://schema.org')
  assert.equal(article['@type'], 'BlogPosting')
  assert.deepEqual(article.author, { '@type': 'Person', name: '作者' })
  assert.equal(article.headline, page.title)
  assert.equal(article.mainEntityOfPage, url)
  assert.equal(article.datePublished, post.date)
  assert.ok(!('dateModified' in article))
  const wiki = structuredData({ ...page, schema: 'TechArticle', author: undefined, published: undefined, modified: post.date }, canonicalUrl('/wiki/gti'))
  assert.equal(wiki.dateModified, post.date)
  assert.ok(!('datePublished' in wiki))
  assert.equal(wiki.author.name, '阿木木')
})

test('unindexed pages omit structured data and JSON-LD safely round-trips script delimiters', () => {
  const page = { path: '/', schema: 'WebSite', title: '展示 </script> 和 <', description: special }
  assert.equal(structuredData({ ...page, robots: 'noindex, follow' }, siteOrigin), undefined)
  const schema = structuredData(page, canonicalUrl('/'))
  const encoded = serializeJsonLd(schema)
  assert.ok(!encoded.includes('<'))
  assert.deepEqual(JSON.parse(encoded), schema)
  assert.equal(schema.name, page.title)
})

test('project Sitemap entries use the canonical route, date and robots policy while RSS remains Blog-only', () => {
  const project = { ...post, slug: 'technical-blog', updated: '2026-11-26' }
  const doc = readXml(sitemapXml([post], [], siteOrigin, [
    project, project, { ...project, slug: 'excluded', seo: { robots: 'noindex' } }
  ]))
  assert.deepEqual(values(doc, 'loc').filter(url => url.includes('/projects')), [
    siteOrigin + '/projects', siteOrigin + '/projects/technical-blog'
  ])
  assert.deepEqual(values(doc, 'lastmod'), [project.updated])
  assert.ok(!rssXml([post]).includes('/projects'))
})

test('project JSON-LD uses verified cover and modification date without invented publication or author data', () => {
  const path = '/projects/technical-blog'
  const url = canonicalUrl(path)
  const page = { path, title: '公开项目', description: '项目摘要', schema: 'CreativeWork',
    modified: '2026-11-26', image: '/images/projects/example.webp' }
  const data = structuredData(page, url)
  assert.equal(url, siteOrigin + path)
  assert.equal(data['@type'], 'CreativeWork')
  assert.equal(data.url, url)
  assert.equal(data.name, page.title)
  assert.equal(data.image, siteOrigin + page.image)
  assert.equal(data.dateModified, page.modified)
  assert.equal(data.datePublished, undefined)
  assert.equal(data.author, undefined)
  assert.equal(structuredData({ ...page, robots: 'noindex, follow' }, url), undefined)
})
