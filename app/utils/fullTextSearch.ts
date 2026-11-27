export type SearchSection = { heading: string; anchor: string; content: string }
export type SearchDocument = {
  kind: 'blog' | 'wiki' | 'project'
  path: string
  title: string
  description: string
  date: string
  sections: SearchSection[]
}
export type TextPart = { text: string; highlighted: boolean }

const termsOf = (query: string) => [...new Set(query.trim().toLowerCase().split(/\s+/u).filter(Boolean))]

// Map lowercase offsets back to the original text. Some Unicode characters
// expand when lowercased (for example İ), so their string offsets can differ.
const matchRanges = (text: string, terms: string[]): Array<[number, number]> => {
  const lower = text.toLowerCase()
  let offset = 0
  const starts: number[] = []
  const ends: number[] = []
  const needOffsets = lower.length !== text.length || terms.some(term => /^[\uDC00-\uDFFF]|[\uD800-\uDBFF]$/.test(term))
  if (needOffsets) {
    for (const character of text) {
      const folded = character.toLowerCase()
      for (let index = 0; index < folded.length; index++) {
        starts.push(offset)
        ends.push(offset + character.length)
      }
      offset += character.length
    }
  }
  const ranges: Array<[number, number]> = []
  for (const term of terms) {
    let start = lower.indexOf(term)
    while (start >= 0) {
      ranges.push(needOffsets ? [starts[start]!, ends[start + term.length - 1]!] : [start, start + term.length])
      start = lower.indexOf(term, start + 1)
    }
  }
  ranges.sort((a, b) => a[0] - b[0])
  return ranges
}

// Literal text ranges are rendered as Vue text nodes, never user-supplied HTML.
export const highlightSearchText = (text: string, query: string): TextPart[] => {
  const ranges = matchRanges(text, termsOf(query))
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
  const first = matchRanges(compact, termsOf(query))[0]
  if (!first || length <= 0) return ''
  const characters = Array.from(compact)
  const matchStart = Array.from(compact.slice(0, first[0])).length
  const matchLength = Array.from(compact.slice(first[0], first[1])).length
  // Keep the actual match in the window, including queries longer than the
  // normal excerpt. Count Unicode code points rather than UTF-16 code units.
  const size = Math.max(Math.floor(length), matchLength)
  const start = Math.min(Math.max(0, matchStart - Math.min(55, size - matchLength)), Math.max(0, characters.length - size))
  const end = Math.min(characters.length, start + size)
  return `${start ? '…' : ''}${characters.slice(start, end).join('')}${end < characters.length ? '…' : ''}`
}

// Lexicographic scores keep each field's priority independent of article length
// and repeated occurrences. Final ties retain section order or sort by URL.
const compareScores = (a: number[], b: number[]) => {
  for (let index = 0; index < a.length; index++) {
    const difference = b[index]! - a[index]!
    if (difference) return difference
  }
  return 0
}

export const searchDocuments = (documents: SearchDocument[], query: string) => {
  const terms = termsOf(query)
  if (!terms.length) return []
  const phrase = terms.join(' ')
  return documents.flatMap(document => {
    const title = document.title.toLowerCase()
    const description = document.description.toLowerCase()
    const sections = document.sections.map(section => ({
      ...section, headingText: section.heading.toLowerCase(), bodyText: section.content.toLowerCase()
    }))
    const fields = [title, description, ...sections.flatMap(section => [section.headingText, section.bodyText])]
    // AND applies to the whole article, allowing terms in different chapters.
    if (!terms.every(term => fields.some(field => field.includes(term)))) return []
    const countMatches = (text: string) => terms.filter(term => text.includes(term)).length
    const hits = sections.flatMap(section => {
      const heading = section.headingText
      const content = section.bodyText
      const coverage = terms.filter(term => heading.includes(term) || content.includes(term)).length
      // Nuxt's unanchored root section also contains the article description.
      // Use it for article matching and summaries, never as a chapter link.
      if (!section.anchor || !coverage) return []
      return [{
        heading: section.heading || '文章内容',
        href: document.path + (section.anchor ? `#${encodeURIComponent(section.anchor)}` : ''),
        content: section.content,
        score: [coverage, Number(heading.trim().replace(/\s+/gu, ' ') === phrase), countMatches(heading), countMatches(content)]
      }]
    }).sort((a, b) => compareScores(a.score, b.score))
    // Deduplicate before limiting. Keep the highest-ranked occurrence of a URL.
    const seen = new Set<string>()
    const related = hits.filter(hit => {
      if (seen.has(hit.href)) return false
      seen.add(hit.href)
      return true
    }).slice(0, 3).map(({ content, ...hit }) => ({ ...hit, snippet: searchContext(content, query) }))
    const score = [
      Number(title.trim().replace(/\s+/gu, ' ') === phrase), countMatches(title),
      Math.max(0, ...sections.map(section => countMatches(section.headingText))),
      countMatches(description), Math.max(0, ...sections.map(section =>
        terms.filter(term => section.headingText.includes(term) || section.bodyText.includes(term)).length))
    ]
    const summary = searchContext(document.description, query)
      || sections.filter(section => !section.anchor).map(section => searchContext(section.content, query)).find(Boolean)
      || ''
    return [{ document, hits: related, summary, score }]
  }).sort((a, b) => compareScores(a.score, b.score)
    || (a.document.path < b.document.path ? -1 : Number(a.document.path > b.document.path)))
}
