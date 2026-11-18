import assert from 'node:assert/strict'
import test from 'node:test'
import { buildTocRows, collectTocItems, visibleTocRows } from '../app/utils/contentToc.ts'

test('official TOC works without a minimark AST and preserves nested depths and IDs', () => {
  const body = { toc: { links: [
    { id: 'chapter', text: 'Chapter', depth: 2, children: [
      { id: 'detail', text: 'Detail', depth: 4, children: [
        { id: 'example', text: 'Example', depth: 6 }
      ] }
    ] },
    { id: 'next', text: 'Next', depth: 2 }
  ] } }
  assert.deepEqual(collectTocItems(body), [
    { id: 'chapter', text: 'Chapter', depth: 2 },
    { id: 'detail', text: 'Detail', depth: 4 },
    { id: 'example', text: 'Example', depth: 6 },
    { id: 'next', text: 'Next', depth: 2 }
  ])
})

test('minimark fallback retains omitted h1 chapters and inline heading text', () => {
  const body = {
    type: 'minimark',
    value: [
      ['h1', { id: 'intro' }, 'C++ ', ['code', {}, 'intro']],
      ['h2', { id: 'variables' }, 'Variables'],
      ['h1', { id: 'types' }, 'Types']
    ],
    toc: { links: [{ id: 'variables', text: 'Variables', depth: 2 }] }
  }
  assert.deepEqual(collectTocItems(body), [
    { id: 'intro', text: 'C++ intro', depth: 1 },
    { id: 'variables', text: 'Variables', depth: 2 },
    { id: 'types', text: 'Types', depth: 1 }
  ])
})

test('official TOC stays authoritative when all minimark heading IDs are represented', () => {
  const body = {
    type: 'minimark',
    value: [['h2', { id: 'chapter' }, 'AST text']],
    toc: { links: [{ id: 'chapter', text: 'Official text', depth: 2 }] }
  }
  assert.deepEqual(collectTocItems(body), [{ id: 'chapter', text: 'Official text', depth: 2 }])
})

test('fallback preserves heading IDs for links and ignores non-headings and missing IDs', () => {
  const body = {
    type: 'minimark',
    value: [
      ['p', { id: 'paragraph' }, 'Paragraph'],
      ['h2', {}, 'Without ID'],
      ['div', {}, ['h3', { id: '_73空指针和野指针' }, '7.3', ['strong', {}, '空指针和野指针']]],
      ['h6', { id: 'deep-example' }, 'Deep example']
    ]
  }
  const items = collectTocItems(body)
  assert.deepEqual(items, [
    { id: '_73空指针和野指针', text: '7.3空指针和野指针', depth: 3 },
    { id: 'deep-example', text: 'Deep example', depth: 6 }
  ])
  assert.deepEqual(buildTocRows(items).map(row => row.id), items.map(item => item.id))
})

const nestedItems = [
  { id: 'a', text: 'A', depth: 1 },
  { id: 'a1', text: 'A1', depth: 3 },
  { id: 'a11', text: 'A11', depth: 6 },
  { id: 'a2', text: 'A2', depth: 2 },
  { id: 'b', text: 'B', depth: 1 },
  { id: 'b1', text: 'B1', depth: 2 }
]

test('row generation finds the nearest shallower parent across skipped heading levels', () => {
  assert.deepEqual(buildTocRows(nestedItems), [
    { ...nestedItems[0], ancestors: [], hasChildren: true },
    { ...nestedItems[1], ancestors: ['a'], hasChildren: true },
    { ...nestedItems[2], ancestors: ['a', 'a1'], hasChildren: false },
    { ...nestedItems[3], ancestors: ['a'], hasChildren: false },
    { ...nestedItems[4], ancestors: [], hasChildren: true },
    { ...nestedItems[5], ancestors: ['b'], hasChildren: false }
  ])
})

test('folding hides descendants independently and retains each collapsed branch', () => {
  const rows = buildTocRows(nestedItems)
  const visible = ids => visibleTocRows(rows, new Set(ids)).map(row => row.id)
  assert.deepEqual(visible(['a']), ['a', 'b', 'b1'])
  assert.deepEqual(visible(['a1']), ['a', 'a1', 'a2', 'b', 'b1'])
  assert.deepEqual(visible(['a', 'a1', 'b']), ['a', 'b'])
  assert.deepEqual(visible([]), rows.map(row => row.id))
  assert.deepEqual(visible(['unknown']), rows.map(row => row.id))

  const collapsed = new Set(['a', 'a1'])
  collapsed.delete('a')
  assert.deepEqual(visibleTocRows(rows, collapsed).map(row => row.id), ['a', 'a1', 'a2', 'b', 'b1'])
  assert.deepEqual([...collapsed], ['a1'])
})

test('TOC transformations leave source content and row data unchanged', () => {
  const body = { toc: { links: [{ id: 'intro', text: 'Intro', depth: 2, children: [] }] } }
  const originalBody = structuredClone(body)
  collectTocItems(body)
  assert.deepEqual(body, originalBody)

  const items = structuredClone(nestedItems)
  const rows = buildTocRows(items)
  const originalRows = structuredClone(rows)
  visibleTocRows(rows, new Set(['a']))
  assert.deepEqual(items, nestedItems)
  assert.deepEqual(rows, originalRows)
})

test('empty content and empty trees do not create phantom headings or rows', () => {
  for (const body of [null, undefined, {}, { type: 'minimark', value: [] }]) {
    assert.deepEqual(collectTocItems(body), [])
  }
  assert.deepEqual(buildTocRows([]), [])
  assert.deepEqual(visibleTocRows([], new Set(['missing'])), [])
})
