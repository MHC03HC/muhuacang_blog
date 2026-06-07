const CHINESE_CHARS_PER_MINUTE = 350
const WORDS_PER_MINUTE = 200

const collectText = (input: unknown, bucket: string[]) => {
  if (!input) return

  if (typeof input === 'string') {
    bucket.push(input)
    return
  }

  if (Array.isArray(input)) {
    input.forEach((item) => collectText(item, bucket))
    return
  }

  if (typeof input === 'object') {
    const record = input as Record<string, unknown>

    if (typeof record.value === 'string') {
      bucket.push(record.value)
    }

    if (typeof record.alt === 'string') {
      bucket.push(record.alt)
    }

    if (typeof record.title === 'string') {
      bucket.push(record.title)
    }

    if (record.children) {
      collectText(record.children, bucket)
    }

    if (record.body) {
      collectText(record.body, bucket)
    }
  }
}

export const estimateReadingMinutes = (content: unknown) => {
  const chunks: string[] = []
  collectText(content, chunks)

  const merged = chunks.join(' ').trim()
  if (!merged) return 1

  const chineseChars = (merged.match(/\p{Script=Han}/gu) || []).length
  const words = (merged.match(/[A-Za-z0-9_]+/g) || []).length

  const minutes = Math.ceil((chineseChars / CHINESE_CHARS_PER_MINUTE) + (words / WORDS_PER_MINUTE))
  return Math.max(1, minutes)
}

export const formatReadingTime = (content: unknown) => {
  return `约 ${estimateReadingMinutes(content)} 分钟阅读`
}
