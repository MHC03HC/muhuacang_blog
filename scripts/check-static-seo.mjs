import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { DOMParser } from '@xmldom/xmldom'
import { parse } from 'parse5'

const origin = 'https://www.muhuacang.cn'
const site = '阿木木的技术博客'
const staticPages = new Map([['/', site], ['/blog', '博客文章'], ['/wiki', 'Wiki'], ['/projects', '科研与工程项目'], ['/about', '关于我']])
const excluded = robots => /(?:^|[,\s])(?:noindex|none)(?=$|[,\s])/i.test(robots || '')

function only(values, label) {
  assert.equal(values.length, 1, `${label} 应恰好出现一次，实际 ${values.length}`)
  return values[0]
}

function checkHead(html, path, article) {
  // Parse the actual head without constructing a second tree for long article bodies.
  const document = parse(html.slice(0, html.indexOf('</head>') + 7))
  const root = document.childNodes.find(node => node.tagName === 'html')
  const nodes = root.childNodes.find(node => node.tagName === 'head').childNodes
  const attr = (node, name) => node.attrs.find(a => a.name === name)?.value
  const tags = (tag, attribute, value) => nodes.filter(n => n.tagName === tag && attr(n, attribute) === value)
  const meta = name => attr(only(tags('meta', name.startsWith('og:') ? 'property' : 'name', name), path + ' ' + name), 'content')
  const text = node => node.childNodes.map(n => n.value).join('')
  const canonical = tags('link', 'rel', 'canonical')
  const scripts = tags('script', 'type', 'application/ld+json')
  if (path === '/404.html') {
    assert.ok(excluded(meta('robots')), '404 必须 noindex')
    assert.equal(canonical.length, 0)
    assert.equal(scripts.length, 0)
    return
  }
  const title = article?.title ?? staticPages.get(path) ?? '搜索'
  const url = origin + path
  const titleTag = text(only(nodes.filter(n => n.tagName === 'title'), path + ' title'))
  assert.equal(titleTag, title === site || title.endsWith(' - ' + site) ? title : title + ' - ' + site, path)
  assert.equal(attr(root, 'lang'), 'zh-CN', path)
  assert.equal(attr(only(canonical, path + ' canonical'), 'href'), url)
  const alternate = only(tags('link', 'rel', 'alternate').filter(n => attr(n, 'type') === 'application/rss+xml'), path + ' RSS')
  assert.equal(new URL(attr(alternate, 'href'), url).href, origin + '/rss.xml')
  const description = meta('description')
  assert.ok(description?.trim(), path + ' description')
  if (article) assert.equal(description, article.description, path)
  assert.equal(meta('og:title'), title, path)
  assert.equal(meta('og:description'), description, path)
  assert.equal(meta('og:url'), url, path)
  assert.equal(meta('og:type'), article ? 'article' : path === '/about' ? 'profile' : 'website', path)
  assert.equal(meta('og:site_name'), site, path)
  assert.equal(meta('og:locale'), 'zh_CN', path)
  assert.ok(['summary', 'summary_large_image'].includes(meta('twitter:card')), path)
  assert.equal(meta('twitter:title'), title, path)
  assert.equal(meta('twitter:description'), description, path)
  const robots = tags('meta', 'name', 'robots')
  assert.ok(robots.length <= 1, path + ' robots 重复')
  if (path === '/search') assert.equal(meta('robots'), 'noindex, follow')
  const indexable = path !== '/search' && !excluded(article?.seo?.robots)
  assert.equal(!excluded(robots[0] && attr(robots[0], 'content')), indexable, path)
  if (article?.cover && path.startsWith('/projects/')) {
    assert.equal(meta('og:image'), origin + article.cover, path)
    assert.equal(meta('twitter:image'), origin + article.cover, path)
  }
  if (!indexable || (!article && path !== '/' && path !== '/projects')) {
    assert.equal(scripts.length, 0, path)
    return
  }
  const data = JSON.parse(text(only(scripts, path + ' JSON-LD')))
  assert.equal(data['@context'], 'https://schema.org', path)
  assert.equal(data.url, url, path)
  assert.equal(data.description, description, path)
  if (!article) {
    assert.equal(data['@type'], path === '/projects' ? 'CollectionPage' : 'WebSite')
    assert.equal(data.name, title)
    return
  }
  if (path.startsWith('/projects/')) {
    assert.equal(data['@type'], 'CreativeWork', path)
    assert.equal(data.name, title, path)
    assert.equal(data.dateModified, article.updated, path)
    assert.equal(data.image, article.cover ? origin + article.cover : undefined, path)
    return
  }
  assert.equal(data['@type'], path.startsWith('/blog/') ? 'BlogPosting' : 'TechArticle', path)
  assert.equal(data.headline, title, path)
  assert.equal(data.mainEntityOfPage, url, path)
  assert.deepEqual(data.author, { '@type': 'Person', name: article.author || '阿木木' }, path)
  assert.equal(data.datePublished, path.startsWith('/blog/') ? article.date : undefined, path)
  assert.equal(data.dateModified, article.updated, path)
}

async function xmlDocument(directory, name) {
  const source = await readFile(join(directory, name), 'utf8')
  return new DOMParser({ onError: (level, message) => { throw new Error(`${name}: ${level} ${message}`) } })
    .parseFromString(source, 'application/xml').documentElement
}

const children = (parent, name) => Array.from(parent.childNodes).filter(n => n.nodeType === 1 && n.tagName === name)
const field = (node, name) => only(children(node, name), node.tagName + '/' + name).textContent

export async function checkStaticSeo(directory, pages, articles) {
  for (const [file, html] of pages) {
    const path = '/' + file.replace(/(?:^|\/)index\.html$/, '')
    checkHead(html, path, articles.get(path))
  }
  const publicArticles = [...articles].filter(([, article]) => !excluded(article.seo?.robots))
  const root = await xmlDocument(directory, 'sitemap.xml')
  assert.equal(root.tagName, 'urlset')
  assert.equal(root.namespaceURI, 'http://www.sitemaps.org/schemas/sitemap/0.9')
  const expected = new Map([...staticPages.keys()].map(path => [origin + path, undefined]))
  for (const [path, article] of publicArticles) expected.set(origin + path, article.updated)
  const urls = children(root, 'url')
  // Comparing sorted arrays catches duplicates as well as missing/extra routes.
  assert.deepEqual(urls.map(node => field(node, 'loc')).sort(), [...expected.keys()].sort(), 'Sitemap 路由')
  for (const node of urls) {
    const url = field(node, 'loc')
    const modified = expected.get(url)
    assert.deepEqual(children(node, 'lastmod').map(n => n.textContent), modified ? [modified] : [], url)
    if (modified) assert.equal(new Date(modified).toISOString().slice(0, 10), modified, url)
  }

  const rss = await xmlDocument(directory, 'rss.xml')
  assert.equal(rss.tagName, 'rss')
  assert.equal(rss.getAttribute('version'), '2.0')
  const channel = only(children(rss, 'channel'), 'RSS channel')
  assert.equal(field(channel, 'link'), origin + '/')
  assert.equal(field(channel, 'title'), site)
  assert.ok(field(channel, 'description').trim())
  const posts = new Map(publicArticles.filter(([path]) => path.startsWith('/blog/')).map(([path, post]) => [origin + path, post]))
  const items = children(channel, 'item')
  assert.deepEqual(items.map(item => field(item, 'link')).sort(), [...posts.keys()].sort(), 'RSS 文章')
  let previousDate = ''
  for (const item of items) {
    const link = field(item, 'link')
    const post = posts.get(link)
    assert.equal(field(item, 'guid'), link)
    assert.equal(field(item, 'title'), post.title, link)
    assert.equal(field(item, 'description'), post.description, link)
    const date = new Date(post.date + 'T00:00:00Z')
    assert.equal(date.toISOString().slice(0, 10), post.date)
    assert.equal(field(item, 'pubDate'), date.toUTCString(), link)
    assert.ok(!previousDate || previousDate >= post.date, 'RSS 必须按发布日期倒序')
    previousDate = post.date
  }
  const robots = await readFile(join(directory, 'robots.txt'), 'utf8')
  assert.match(robots, /^User-agent:\s*\*\s*$/im)
  assert.deepEqual([...robots.matchAll(/^Sitemap:\s*(\S+)/gim)].map(m => m[1]), [origin + '/sitemap.xml'])
  assert.doesNotMatch(robots, /^Disallow:\s*\/(?:\s*$|(?:blog|wiki|projects|search|about|_nuxt|images|rss\.xml|sitemap\.xml)(?:\/|\s*$))/im)
  return `Sitemap ${urls.length} 个 URL，RSS ${items.length} 篇博客，HTML 元数据、JSON-LD 和 robots.txt 均通过。`
}
