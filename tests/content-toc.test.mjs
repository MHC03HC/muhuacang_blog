import assert from 'node:assert/strict'
import test from 'node:test'
import { collectTocItems, buildTocRows, visibleTocRows } from '../app/utils/contentToc.ts'

test('official TOC works without a minimark AST and retains nested depths', () => {
  assert.deepEqual(collectTocItems({ toc: { links: [
    { id: 'chapter', text: 'Chapter', depth: 2, children: [
      { id: 'detail', text: 'Detail', depth: 4 }
    ] }
  ] } }), [
    { id: 'chapter', text: 'Chapter', depth: 2 },
    { id: 'detail', text: 'Detail', depth: 4 }
  ])
})

test('imported h1 chapters remain in order with inline heading text', () => {
  const body = {
    type: 'minimark',
    value: [
      ['h1', { id: 'intro' }, 'C++ ', ['code', {}, 'intro']],
      ['h2', { id: 'variables' }, 'Variables'],
      ['h1', { id: 'types' }, 'Types']
    ],
    toc: { links: [{ id: 'variables', text: 'Variables', depth: 2 }] }
  }
  const items = collectTocItems(body)
  assert.deepEqual(items.map(item => item.id), ['intro', 'variables', 'types'])
  assert.equal(items[0].text, 'C++ intro')
})

test('folding is independent, handles skipped levels and preserves child folds', () => {
  const rows = buildTocRows([
    { id: 'a', text: 'A', depth: 1 },
    { id: 'a1', text: 'A1', depth: 3 },
    { id: 'a11', text: 'A11', depth: 6 },
    { id: 'a2', text: 'A2', depth: 2 },
    { id: 'b', text: 'B', depth: 1 },
    { id: 'b1', text: 'B1', depth: 2 }
  ])
  const visible = (ids) => visibleTocRows(rows, new Set(ids)).map(row => row.id)
  assert.deepEqual(visible(['a']), ['a', 'b', 'b1'])
  assert.deepEqual(visible(['a1']), ['a', 'a1', 'a2', 'b', 'b1'])
  assert.deepEqual(visible(['a', 'a1', 'b']), ['a', 'b'])
  assert.deepEqual(visible([]), rows.map(row => row.id))
  assert.deepEqual(rows[2].ancestors, ['a', 'a1'])
  assert.deepEqual(rows[3].ancestors, ['a'])
})

test('empty content does not create a phantom directory', () => {
  assert.deepEqual(collectTocItems(null), [])
  assert.deepEqual(collectTocItems({}), [])
  assert.deepEqual(buildTocRows([]), [])
})
