export type ContentTocItem = {
  id: string
  text: string
  depth: number
}

type OfficialTocItem = ContentTocItem & { children?: OfficialTocItem[] }

const flattenOfficialToc = (items: OfficialTocItem[]): ContentTocItem[] => {
  return items.flatMap(({ children, ...item }) => [item, ...flattenOfficialToc(children || [])])
}

// Prefer Nuxt Content's public body.toc API. MDC currently omits h1 from it.
// Keep the minimark compatibility fallback here, outside UI and page logic.
export const collectTocItems = (body: unknown): ContentTocItem[] => {
  if (!body || typeof body !== 'object') return []
  const content = body as { toc?: { links?: OfficialTocItem[] }; type?: string; value?: unknown }
  const official = flattenOfficialToc(content.toc?.links || [])
  if (content.type !== 'minimark' || !Array.isArray(content.value)) return official

  const fallback: ContentTocItem[] = []
  const textOf = (node: unknown): string => {
    if (typeof node === 'string') return node
    if (!Array.isArray(node)) return ''
    return node.slice(2).map(textOf).join('')
  }
  const visit = (node: unknown) => {
    if (!Array.isArray(node)) return
    const [tag, attrs] = node
    if (typeof tag === 'string' && /^h[1-6]$/.test(tag)) {
      const id = attrs && typeof attrs === 'object' ? (attrs as Record<string, unknown>).id : null
      if (typeof id === 'string') fallback.push({ id, text: textOf(node), depth: Number(tag[1]) })
      return
    }
    node.forEach(visit)
  }
  visit(content.value)
  const officialIds = new Set(official.map((item) => item.id))
  return fallback.some((item) => !officialIds.has(item.id)) ? fallback : official
}


export type TocRow = ContentTocItem & {
  ancestors: string[]
  hasChildren: boolean
}

// A heading belongs to the nearest preceding heading of a shallower depth.
// This also handles Markdown that skips a heading level.
export const buildTocRows = (items: ContentTocItem[]): TocRow[] => {
  const parents: ContentTocItem[] = []
  return items.map((item, index) => {
    while (parents.length && parents[parents.length - 1]!.depth >= item.depth) {
      parents.pop()
    }
    const row = {
      ...item,
      ancestors: parents.map((parent) => parent.id),
      hasChildren: (items[index + 1]?.depth ?? 0) > item.depth
    }
    parents.push(item)
    return row
  })
}

export const visibleTocRows = (rows: TocRow[], collapsed: ReadonlySet<string>) => {
  return rows.filter((row) => row.ancestors.every((id) => !collapsed.has(id)))
}
