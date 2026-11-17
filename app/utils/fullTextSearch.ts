export type SearchSection = { heading: string; anchor: string; content: string }
export type SearchDocument = {
  kind: 'blog' | 'wiki'
  path: string
  title: string
  description: string
  date: string
  sections: SearchSection[]
}
export type TextPart = { text: string; highlighted: boolean }

const termsOf = (query: string) => [...new Set(query.trim().toLowerCase().split(/\s+/u).filter(Boolean))]

// Work with literal ranges, never regular expressions made from user input or HTML.
export const highlightSearchText = (text: string, query: string): TextPart[] => {
  const ranges: Array<[number, number]> = []
  const lower = text.toLowerCase()
  for (const term of termsOf(query)) {
    let start = lower.indexOf(term)
    while (start >= 0) {
      ranges.push([start, start + term.length])
      start = lower.indexOf(term, start + term.length)
    }
  }
  ranges.sort((a, b) => a[0] - b[0])
  const merged: Array<[number, number]> = []
  for (const range of ranges) {
    const previous = merged.at(-1)
    if (previous && range[0] <= previous[1]) previous[1] = Math.max(previous[1], range[1])
    else merged.push([...range])
  }
  const parts: TextPart[] = []
  let cursor = 0
  for (const [start, end] of merged) {
    if (cursor < start) parts.push({ text: text.slice(cursor, start), highlighted: false })
    parts.push({ text: text.slice(start, end), highlighted: true })
    cursor = end
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), highlighted: false })
  return parts
}

export const searchContext = (text: string, query: string, length = 180) => {
  const compact = text.replace(/\s+/gu, ' ').trim()
  const matches = termsOf(query).map(term => compact.toLowerCase().indexOf(term)).filter(index => index >= 0)
  let start = matches.length ? Math.max(0, Math.min(...matches) - 55) : 0
  start = Math.min(start, Math.max(0, compact.length - length))
  // Avoid cutting a surrogate pair at either boundary.
  if (start && /[\uDC00-\uDFFF]/u.test(compact[start]!)) start--
  let end = Math.min(compact.length, start + length)
  if (end < compact.length && /[\uDC00-\uDFFF]/u.test(compact[end]!)) end++
  return `${start ? '…' : ''}${compact.slice(start, end)}${end < compact.length ? '…' : ''}`
}

export const searchDocuments = (documents: SearchDocument[], query: string) => {
  const terms = termsOf(query)
  if (!terms.length) return []
  return documents.flatMap(document => {
    const title = document.title.toLowerCase()
    const description = document.description.toLowerCase()
    const hits = document.sections.flatMap(section => {
      const heading = section.heading.toLowerCase()
      const content = section.content.toLowerCase()
      const fields = [title, description, heading, content].join(' ')
      if (!terms.every(term => fields.includes(term))) return []
      const score = terms.reduce((sum, term) => sum
        + (title.includes(term) ? 40 : 0)
        + (description.includes(term) ? 12 : 0)
        + (heading.includes(term) ? 30 : 0)
        + (content.includes(term) ? 4 : 0), 0)
      return [{
        heading: section.heading || '文章内容',
        href: document.path + (section.anchor ? `#${encodeURIComponent(section.anchor)}` : ''),
        snippet: searchContext(section.content || document.description, query),
        score
      }]
    }).sort((a, b) => b.score - a.score)
    if (!hits.length) return []
    // Title-only matches should not flood the result with every chapter.
    const relevant = hits.filter(hit => terms.some(term =>
      hit.heading.toLowerCase().includes(term) || hit.snippet.toLowerCase().includes(term)))
    return [{ document, hits: (relevant.length ? relevant : hits).slice(0, 3), score: hits[0]!.score }]
  }).sort((a, b) => b.score - a.score || a.document.path.localeCompare(b.document.path))
}
