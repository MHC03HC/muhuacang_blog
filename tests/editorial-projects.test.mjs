import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { resolveFeatured } from '../app/utils/featured.ts'
import { isCalendarDate, isGitHubProjectUrl, isLocalCover, isProjectSlug, projectPath, projectStatusLabels,
  projectSummary, selectHomeProjects, sortProjects } from '../app/utils/projects.ts'
import { normalizeThemePreference, resolveTheme, THEME_STORAGE_KEY } from '../app/utils/theme.ts'
import { validateProjectSources } from '../scripts/content-sources.mjs'

const posts = [
  { slug: 'shared', title: '博客标题', description: '博客摘要', date: '2026-06-05' },
  { slug: 'second', title: '博客第二篇', description: '博客第二篇摘要', date: '2026-06-06' }
]
const wiki = [
  { slug: 'shared', title: 'Wiki 标题', description: 'Wiki 摘要', updated: '2026-11-19' },
  { slug: 'gti', title: 'Git', description: 'Wiki Git', updated: '2026-11-18' }
]

test('featured entries preserve configured order after moving the first primary to the lead', () => {
  const results = resolveFeatured([
    { kind: 'wiki', slug: 'shared' }, { kind: 'blog', slug: 'shared', primary: true }, { kind: 'wiki', slug: 'gti' }
  ], posts, wiki)
  assert.deepEqual(results.map(item => [item.path, item.title, item.description, item.date, item.primary]), [
    ['/blog/shared', '博客标题', '博客摘要', '2026-06-05', true],
    ['/wiki/shared', 'Wiki 标题', 'Wiki 摘要', '2026-11-19', false],
    ['/wiki/gti', 'Git', 'Wiki Git', '2026-11-18', false]
  ])
})

test('featured entries skip invalid types, unknown slugs and duplicates with actionable warnings', () => {
  const warnings = []
  const results = resolveFeatured([
    { kind: 'unknown', slug: 'gti' }, { kind: 'blog', slug: 10 }, { kind: 'blog', slug: 'shared', primary: 1 },
    { kind: 'wiki', slug: 'unknown', primary: true }, { kind: 'wiki', slug: 'gti', primary: true },
    { kind: 'wiki', slug: 'gti' }, { kind: 'blog', slug: 'second', primary: true }
  ], posts, wiki, [], message => warnings.push(message))
  assert.deepEqual(results.map(item => [item.path, item.primary]), [['/wiki/gti', true], ['/blog/second', false]])
  assert.equal(warnings.length, 6)
  assert.ok(warnings.some(message => message.includes('/wiki/unknown')))
})

test('featured handles Blog-only, Wiki-only, missing primaries and empty collections without invented cards', () => {
  for (const [kind, data] of [['blog', posts], ['wiki', wiki]]) {
    const choice = [{ kind, slug: data[0].slug }]
    assert.deepEqual(resolveFeatured(choice, posts, wiki).map(item => [item.path, item.primary]),
      [[`/${kind}/${data[0].slug}`, true]])
    assert.deepEqual(resolveFeatured(choice, [], []), [])
  }
  assert.deepEqual(resolveFeatured([], posts, wiki), [])
})

test('featured keeps a verified local cover and displays the text when the cover is unavailable', () => {
  const cover = '/images/projects/cover.webp'
  const selection = [{ kind: 'blog', slug: 'shared', cover }, { kind: 'wiki', slug: 'gti', cover: '/images/missing.png' }]
  assert.deepEqual(resolveFeatured(selection, posts, wiki, [cover]).map(item => item.cover), [cover, undefined])
  assert.equal(resolveFeatured([{ ...selection[0], cover: 'https://example.com/image.webp' }], posts, wiki)[0].cover, undefined)
})

const project = (slug, rest) => projectSummary({ slug, description: '摘要', title: slug, ...rest })

test('project sorting uses order and slug, and home shows only featured entries up to its limit', () => {
  const items = [project('beta', { featured: true, order: 2 }), project('alpha', { featured: true, order: 2 }),
    project('unfeatured', { order: 0 }), project('first', { featured: true, order: 1 })]
  assert.deepEqual(sortProjects(items).map(item => item.slug), ['unfeatured', 'first', 'alpha', 'beta'])
  assert.deepEqual(selectHomeProjects(items, 2).map(item => item.slug), ['first', 'alpha'])
  assert.deepEqual(items.map(item => item.slug), ['beta', 'alpha', 'unfeatured', 'first'])
  assert.deepEqual(selectHomeProjects([items[2]]), [])
  assert.deepEqual(selectHomeProjects([]), [])
})

test('project summary omits the Markdown AST and supplies defaults for optional data', () => {
  const summary = project('example', { body: { value: ['AST'] }, updated: '', github: '', cover: '' })
  assert.deepEqual(summary, { title: 'example', slug: 'example', description: '摘要', status: 'ongoing',
    featured: false, order: 999, technologies: [], updated: undefined, github: undefined, cover: undefined })
  assert.equal(projectPath(summary.slug), '/projects/example')
  assert.deepEqual(projectStatusLabels, { planned: '计划中', ongoing: '进行中', completed: '已完成', archived: '已归档' })
})

test('project input validators accept valid calendar dates and reject unsafe slugs, URLs and covers', () => {
  for (const slug of ['technical-blog', '7', 'wiki-1']) assert.ok(isProjectSlug(slug))
  for (const slug of ['../x', 'a/b', 'A-b', 'x--y', 'x_', 'a'.repeat(81)]) assert.ok(!isProjectSlug(slug))
  for (const date of ['2024-02-29', '2026-11-27']) assert.ok(isCalendarDate(date))
  for (const date of ['2026-2-3', '2025-02-29', '2026-13-01', '2026-04-31', '2026-01-01T00:00:00Z']) assert.ok(!isCalendarDate(date))
  assert.ok(isGitHubProjectUrl('https://github.com/MHC03HC/muhuacang_blog'))
  for (const url of ['javascript:alert(1)', '//github.com/o/r', 'http://github.com/o/r', 'https://github.com.evil.test/o/r',
    'https://github.com@evil.test/o/r', 'https://github.com/o/..', 'https://github.com/o/r?q=1']) assert.ok(!isGitHubProjectUrl(url))
  assert.ok(isLocalCover('/images/projects/cover.webp'))
  for (const path of ['/images/../cover.png', '/images/cover.svg', '/images/cover.php', '/images/%2E%2E/a.webp',
    '//example.test/cover.webp', '/images/path/cover.jpg?raw']) assert.ok(!isLocalCover(path))
})

test('project source validation checks defaults, duplicate slugs, URL and date accuracy before content parsing', async t => {
  const root = await mkdtemp(join(tmpdir(), 'blog-project-source-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const dir = join(root, 'content', 'projects')
  await assert.doesNotReject(validateProjectSources(root))
  await mkdir(dir, { recursive: true })
  const source = extra => `---\ntitle: 技术项目\nslug: shared\ndescription: 技术项目摘要\n${extra || ''}\n---\n内容\n`
  const path = join(dir, 'a.md')
  await writeFile(path, source())
  await assert.doesNotReject(validateProjectSources(root))
  for (const [extra, message] of [
    ['updated: 2026-02-30', /updated 必须/], ['github: http://github.com/o/r', /github 必须/],
    ['cover: /images/projects/missing.webp', /cover 必须/], ['featured: yes', /featured/],
    ['technologies: [' + Array(17).fill('Nuxt').join(',') + ']', /最多包含 16 项/]
  ]) {
    await writeFile(path, source(extra))
    await assert.rejects(validateProjectSources(root), message)
  }
  await writeFile(path, source() + 'x'.repeat(512 * 1024))
  await assert.rejects(validateProjectSources(root), /512 KiB/)
  await writeFile(path, source())
  await writeFile(join(dir, 'b.md'), source())
  await assert.rejects(validateProjectSources(root), /slug shared .*重复/)
})

test('legacy light and dark preferences keep the same key and override the operating system', () => {
  assert.equal(THEME_STORAGE_KEY, 'amumu-theme')
  assert.equal(resolveTheme(normalizeThemePreference('light'), true), 'light')
  assert.equal(resolveTheme(normalizeThemePreference('dark'), false), 'dark')
})

test('system preference reflects each operating system change and invalid values use the same fallback', () => {
  for (const raw of ['system', null, '', 'sepia', 42]) {
    const preference = normalizeThemePreference(raw)
    assert.equal(preference, 'system')
    assert.equal(resolveTheme(preference, false), 'light')
    assert.equal(resolveTheme(preference, true), 'dark')
  }
})
