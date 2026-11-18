import assert from 'node:assert/strict'
import test from 'node:test'
import { highlightSearchText, searchContext, searchDocuments } from '../app/utils/fullTextSearch.ts'

const createDocument = (overrides = {}) => ({
  kind: 'wiki',
  path: '/wiki/example',
  title: 'Example',
  description: '',
  date: '2026-01-01',
  sections: [],
  ...overrides
})

const createSection = (heading, content, anchor = heading) => ({ heading, content, anchor })
const resultPaths = (documents, query) => searchDocuments(documents, query).map(result => result.document.path)

test('an exact article title ranks before a partial title match', () => {
  const documents = [
    createDocument({ path: '/wiki/partial', title: 'PPO guide' }),
    createDocument({ path: '/wiki/exact', title: 'PPO' })
  ]
  assert.deepEqual(resultPaths(documents, 'PPO'), ['/wiki/exact', '/wiki/partial'])
})

test('a partial article title matches without requiring sections', () => {
  const document = createDocument({ title: 'C++探索之旅' })
  const results = searchDocuments([document], '探索')
  assert.equal(results.length, 1)
  assert.equal(results[0].document.path, document.path)
  assert.deepEqual(results[0].hits, [])
})

test('a section title matches without an unrelated body excerpt', () => {
  const document = createDocument({ sections: [createSection('PPO', 'Unrelated body', 'ppo')] })
  const results = searchDocuments([document], 'PPO')
  assert.equal(results.length, 1)
  assert.equal(results[0].hits.length, 1)
  assert.equal(results[0].hits[0].heading, 'PPO')
  assert.equal(results[0].hits[0].snippet, '')
})

test('section body text is searchable and supplies the matching excerpt', () => {
  const document = createDocument({ sections: [createSection('Pointers', '这里说明野指针的风险。', 'pointers')] })
  const results = searchDocuments([document], '野指针')
  assert.equal(results.length, 1)
  assert.equal(results[0].hits[0].href, '/wiki/example#pointers')
  assert.equal(results[0].hits[0].snippet, '这里说明野指针的风险。')
})

test('a description-only match supplies an article summary without chapter links', () => {
  const document = createDocument({
    description: 'PPO algorithm overview',
    sections: [createSection('Installation', 'Install the tools')]
  })
  const results = searchDocuments([document], 'PPO')
  assert.equal(results.length, 1)
  assert.deepEqual(results[0].hits, [])
  assert.equal(results[0].summary, document.description)
})

test('a title-only match does not promote unrelated sections or summaries', () => {
  const document = createDocument({
    title: 'PPO',
    description: 'Installation notes',
    sections: [createSection('Setup', 'Install the tools'), createSection('Run', 'Start the application')]
  })
  const results = searchDocuments([document], 'PPO')
  assert.equal(results.length, 1)
  assert.deepEqual(results[0].hits, [])
  assert.equal(results[0].summary, '')
})

test('article-level AND can combine title, description and section fields', () => {
  const document = createDocument({
    title: 'PPO',
    description: 'SAC',
    sections: [createSection('DQN', '强化学习算法')]
  })
  const results = searchDocuments([document], 'PPO SAC DQN 强化学习')
  assert.equal(results.length, 1)
  assert.deepEqual(results[0].hits.map(hit => hit.heading), ['DQN'])
})

test('AND permits keywords in separate chapters and ranks concentrated matches first', () => {
  const document = createDocument({ sections: [
    createSection('First algorithm', 'PPO', 'ppo'),
    createSection('Second algorithm', 'SAC', 'sac'),
    createSection('Comparison', 'PPO and SAC', 'comparison')
  ] })
  const results = searchDocuments([document], 'PPO SAC')
  assert.equal(results.length, 1)
  assert.deepEqual(results[0].hits.map(hit => hit.heading), ['Comparison', 'First algorithm', 'Second algorithm'])
})

test('AND excludes articles missing any query keyword', () => {
  const document = createDocument({ title: 'PPO', sections: [createSection('Algorithm', 'SAC')] })
  assert.deepEqual(searchDocuments([document], 'PPO SAC DQN'), [])
})

test('English case, surrounding whitespace and duplicate keywords do not change results', () => {
  const document = createDocument({ sections: [
    createSection('PPO', 'PPO algorithm', 'ppo'),
    createSection('SAC', 'SAC algorithm', 'sac')
  ] })
  const expected = searchDocuments([document], 'ppo sac')
  assert.equal(expected.length, 1)
  assert.deepEqual(searchDocuments([document], '  PPO \t sac\nPPO  '), expected)
})

test('Chinese, English and mixed queries match literal indexed content', () => {
  const document = createDocument({ sections: [createSection('算法', 'PPO 策略梯度优化')] })
  for (const query of ['策略梯度', 'PPO', 'PPO 梯度']) {
    assert.deepEqual(resultPaths([document], query), [document.path], query)
  }
})

test('C++, operators and regular-expression punctuation are searched literally', () => {
  const document = createDocument({ sections: [createSection('Syntax', 'C++ && || [x] .*')] })
  for (const query of ['C++', '&&', '||', '[x]', '.*']) {
    assert.deepEqual(resultPaths([document], query), [document.path], query)
  }
  assert.deepEqual(searchDocuments([document], '[missing]'), [])
})

test('article ranking prioritizes title, section heading, description, then body', () => {
  const documents = [
    createDocument({ path: '/wiki/body', sections: [createSection('Notes', 'PPO '.repeat(500))] }),
    createDocument({ path: '/wiki/description', description: 'PPO' }),
    createDocument({ path: '/wiki/heading', sections: [createSection('PPO', '')] }),
    createDocument({ path: '/wiki/title', title: 'PPO guide' })
  ]
  assert.deepEqual(resultPaths(documents, 'PPO'), [
    '/wiki/title', '/wiki/heading', '/wiki/description', '/wiki/body'
  ])
})

test('more matching title keywords rank before fewer matching title keywords', () => {
  const documents = [
    createDocument({ path: '/wiki/one', title: 'PPO guide', sections: [createSection('SAC', 'SAC')] }),
    createDocument({ path: '/wiki/two', title: 'PPO SAC comparison' })
  ]
  assert.deepEqual(resultPaths(documents, 'PPO SAC'), ['/wiki/two', '/wiki/one'])
})

test('an exact section heading ranks before a partial heading with equal coverage', () => {
  const document = createDocument({ sections: [
    createSection('PPO guide', '', 'partial'),
    createSection('PPO', '', 'exact')
  ] })
  assert.deepEqual(searchDocuments([document], 'PPO')[0].hits.map(hit => hit.heading), ['PPO', 'PPO guide'])
})

test('equal article scores sort by URL independently of input order', () => {
  const documents = [
    createDocument({ path: '/wiki/z', title: 'PPO' }),
    createDocument({ path: '/blog/a', kind: 'blog', title: 'PPO' }),
    createDocument({ path: '/wiki/a', title: 'PPO' })
  ]
  const expected = ['/blog/a', '/wiki/a', '/wiki/z']
  assert.deepEqual(resultPaths(documents, 'PPO'), expected)
  assert.deepEqual(resultPaths([...documents].reverse(), 'PPO'), expected)
  assert.deepEqual(searchDocuments(documents, 'PPO'), searchDocuments(documents, 'PPO'))
})

test('equal section scores retain original article order', () => {
  const document = createDocument({ sections: [
    createSection('Z chapter', 'PPO', 'z'),
    createSection('A chapter', 'PPO', 'a')
  ] })
  assert.deepEqual(searchDocuments([document], 'PPO')[0].hits.map(hit => hit.heading), ['Z chapter', 'A chapter'])
})

test('chapter URLs are deduplicated before the three-hit limit using the best occurrence', () => {
  const document = createDocument({ sections: [
    createSection('Partial', 'PPO', 'shared'),
    createSection('Best', 'PPO SAC', 'shared'),
    createSection('Second', 'PPO SAC', 'second'),
    createSection('Third', 'PPO SAC', 'third'),
    createSection('Fourth', 'PPO SAC', 'fourth')
  ] })
  const results = searchDocuments([document], 'PPO SAC')
  assert.equal(results.length, 1)
  assert.deepEqual(results[0].hits.map(hit => hit.heading), ['Best', 'Second', 'Third'])
  assert.equal(new Set(results[0].hits.map(hit => hit.href)).size, 3)
})

test('only chapters with their own keyword matches are included', () => {
  const document = createDocument({ title: 'PPO', sections: [
    createSection('Unrelated', 'Installation notes'),
    createSection('Algorithm', 'PPO update rule', 'algorithm'),
    createSection('Other', 'Unrelated body')
  ] })
  const hits = searchDocuments([document], 'PPO')[0].hits
  assert.equal(hits.length, 1)
  assert.equal(hits[0].href, '/wiki/example#algorithm')
  assert.match(hits[0].snippet, /PPO/)
})

test('unanchored root content supplies an article summary without duplicate article links', () => {
  const document = createDocument({ sections: [createSection('', 'Root text about PPO', '')] })
  const results = searchDocuments([document], 'PPO')
  assert.equal(results.length, 1)
  assert.deepEqual(results[0].hits, [])
  assert.equal(results[0].summary, 'Root text about PPO')
})

test('public blog and Wiki paths are retained and chapter anchors are encoded', () => {
  for (const [kind, path] of [['blog', '/blog/example'], ['wiki', '/wiki/example']]) {
    const document = createDocument({ kind, path, sections: [createSection('章节', 'PPO', '章节 &&')] })
    const result = searchDocuments([document], 'PPO')[0]
    assert.equal(result.document.path, path)
    assert.equal(result.hits[0].href, `${path}#${encodeURIComponent('章节 &&')}`)
  }
})

test('empty queries, empty indexes and unmatched queries return no results', () => {
  const document = createDocument({ title: 'PPO' })
  assert.deepEqual(searchDocuments([document], ''), [])
  assert.deepEqual(searchDocuments([document], ' \t\n '), [])
  assert.deepEqual(searchDocuments([document], 'missing'), [])
  assert.deepEqual(searchDocuments([], 'PPO'), [])
})

test('excerpts are centered around a real match deep inside a long section', () => {
  const text = 'a'.repeat(800) + 'PPO' + 'b'.repeat(800)
  const excerpt = searchContext(text, 'PPO')
  assert.match(excerpt, /PPO/)
  assert.ok(excerpt.startsWith('…'))
  assert.ok(excerpt.endsWith('…'))
  assert.equal(Array.from(excerpt).length, 182)
  assert.ok(text.includes(excerpt.slice(1, -1)))
})

test('excerpts normalize whitespace and remain empty when there is no real match', () => {
  assert.equal(searchContext('  PPO\n\t algorithm  ', 'PPO'), 'PPO algorithm')
  assert.equal(searchContext('Unrelated text', 'PPO'), '')
  assert.equal(searchContext('PPO', ''), '')
  assert.equal(searchContext('', 'PPO'), '')
  assert.equal(searchContext('PPO', 'PPO', 0), '')
})

test('Unicode excerpts count code points and preserve emoji at truncation boundaries', () => {
  const text = '😀'.repeat(200) + '目标😀' + '😀'.repeat(200)
  const excerpt = searchContext(text, '目标', 20)
  assert.match(excerpt, /目标/)
  assert.ok(excerpt.startsWith('…'))
  assert.ok(excerpt.endsWith('…'))
  assert.equal(excerpt.isWellFormed(), true)
  assert.ok(Array.from(excerpt).length <= 22)
  assert.ok(text.includes(excerpt.slice(1, -1)))
})

test('a long matching keyword remains intact in its excerpt', () => {
  const keyword = 'P'.repeat(200)
  const excerpt = searchContext('x'.repeat(100) + keyword + 'y'.repeat(100), keyword)
  assert.equal(excerpt, `…${keyword}…`)
})

test('adjacent and overlapping repeated matches do not expand the excerpt limit', () => {
  for (const [text, query] of [['a'.repeat(2000), 'a'], ['ab'.repeat(2000), 'aba']]) {
    const excerpt = searchContext(text, query)
    assert.ok(excerpt.includes(query))
    assert.equal(Array.from(excerpt).length, 181)
    assert.ok(excerpt.endsWith('…'))
  }
})

test('excerpt selection follows the earliest actual match independently of keyword order', () => {
  const text = 'x'.repeat(100) + 'first' + 'y'.repeat(400) + 'later'
  const excerpt = searchContext(text, 'later first')
  assert.ok(excerpt.includes('first'))
  assert.equal(excerpt.includes('later'), false)
  assert.equal(excerpt, searchContext(text, 'first later'))
})

test('Unicode excerpt boundaries preserve emoji and original lowercase offsets', () => {
  const context = searchContext('😀'.repeat(200) + '目标😀' + '😀'.repeat(200), '目标😀', 20)
  assert.ok(context.includes('目标😀'))
  assert.equal(context.isWellFormed(), true)
  assert.equal(Array.from(context).length, 22)
  assert.equal(searchContext('İ PPO notes', 'PPO', 3), '…PPO…')
})

test('overlapping occurrences of the same keyword merge into one highlight', () => {
  assert.deepEqual(highlightSearchText('ababa', 'aba'), [{ text: 'ababa', highlighted: true }])
})

test('overlapping different keywords merge without duplicating text', () => {
  assert.deepEqual(highlightSearchText('C++', 'c++ ++'), [{ text: 'C++', highlighted: true }])
})

test('Unicode case conversion preserves original highlight boundaries and text', () => {
  assert.deepEqual(highlightSearchText('İ PPO😀', 'ppo'), [
    { text: 'İ ', highlighted: false },
    { text: 'PPO', highlighted: true },
    { text: '😀', highlighted: false }
  ])
  assert.deepEqual(highlightSearchText('İ', 'i'), [{ text: 'İ', highlighted: true }])
  assert.deepEqual(highlightSearchText('ΟΣ', 'ος'), [{ text: 'ΟΣ', highlighted: true }])
  assert.deepEqual(highlightSearchText('😀目标😀', '目标'), [
    { text: '😀', highlighted: false },
    { text: '目标', highlighted: true },
    { text: '😀', highlighted: false }
  ])
})

test('highlighting operators covers all literal occurrences', () => {
  assert.deepEqual(highlightSearchText('C++ && || C++', 'c++ && ||'), [
    { text: 'C++', highlighted: true },
    { text: ' ', highlighted: false },
    { text: '&&', highlighted: true },
    { text: ' ', highlighted: false },
    { text: '||', highlighted: true },
    { text: ' ', highlighted: false },
    { text: 'C++', highlighted: true }
  ])
})

test('empty and unmatched highlighting keeps the original text intact', () => {
  assert.deepEqual(highlightSearchText('PPO', ''), [{ text: 'PPO', highlighted: false }])
  assert.deepEqual(highlightSearchText('PPO', 'missing'), [{ text: 'PPO', highlighted: false }])
  assert.deepEqual(highlightSearchText('', 'PPO'), [])
})

test('HTML-looking input remains literal text parts that reconstruct the original', () => {
  const text = '<img src=x onerror=alert(1)> C++'
  const parts = highlightSearchText(text, '<img C++')
  assert.deepEqual(parts, [
    { text: '<img', highlighted: true },
    { text: ' src=x onerror=alert(1)> ', highlighted: false },
    { text: 'C++', highlighted: true }
  ])
  assert.equal(parts.map(part => part.text).join(''), text)
})
