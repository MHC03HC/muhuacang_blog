import type { ContentTocItem } from '../composables/useContentEnhancements'

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
