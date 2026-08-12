export const normalizeSearchQuery = (value: unknown) => {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

export const matchesContentSearch = (query: string, fields: unknown[]) => {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) return true

  const haystack = fields
    .flatMap((field) => Array.isArray(field) ? field : [field])
    .filter((field): field is string => typeof field === 'string' && Boolean(field))
    .join(' ')
    .toLowerCase()

  return haystack.includes(normalizedQuery)
}
