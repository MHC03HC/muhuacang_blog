import type { Ref } from 'vue'

import { readingProgress, showBackToTop } from '~/utils/readingProgress'
import { collectTocItems, type ContentTocItem } from '~/utils/contentToc'

export const useContentEnhancements = (
  contentRef: Ref<HTMLElement | null>,
  contentKey: () => unknown,
  bodySource: () => unknown
) => {
  const tocItems = ref<ContentTocItem[]>(collectTocItems(bodySource()))
  const activeHeadingId = ref(tocItems.value[0]?.id || '')
  const shouldShowToc = computed(() => tocItems.value.length >= 2)

  const router = useRouter()
  const progress = ref(0)
  const showTop = ref(false)
  const headerHeight = ref(0)
  let headingCleanup: (() => void) | null = null
  let scrollFrame = 0
  let disposed = false

  const disconnectHeadings = () => {
    headingCleanup?.()
    headingCleanup = null
    if (scrollFrame) cancelAnimationFrame(scrollFrame)
    scrollFrame = 0
  }

  const trackHeadings = () => {
    disconnectHeadings()

    const body = contentRef.value
    if (!body) return

    const header = document.querySelector('.site-header')
    const headings = body.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
    const update = () => {
      scrollFrame = 0
      const headerBottom = header?.getBoundingClientRect().bottom || 0
      const offset = headerBottom + 24
      const rect = body.getBoundingClientRect()
      const viewport = window.innerHeight
      progress.value = readingProgress(rect.top, rect.height, viewport, headerBottom)
      showTop.value = showBackToTop(window.scrollY, rect.height, viewport)
      headerHeight.value = headerBottom

      // Headings are in document order. Only sample the current search interval.
      let low = 0
      let high = headings.length
      while (low < high) {
        const mid = Math.floor((low + high) / 2)
        if (headings[mid]!.getBoundingClientRect().top <= offset + 1) low = mid + 1
        else high = mid
      }
      activeHeadingId.value = headings[Math.max(0, low - 1)]?.id || ''
    }
    const schedule = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(update)
    }
    const observer = new ResizeObserver(schedule)
    observer.observe(body)
    if (header) observer.observe(header)
    if (body.parentElement) observer.observe(body.parentElement)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()
    headingCleanup = () => {
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }

  const syncToc = () => {
    tocItems.value = collectTocItems(bodySource())
    activeHeadingId.value = tocItems.value[0]?.id || ''
  }

  const scrollToHeading = (id: string) => {
    if (!import.meta.client) return

    const target = document.getElementById(id)
    if (!target) return

    if (!contentRef.value?.contains(target)) return
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
    const hash = `#${id}`
    if (router.currentRoute.value.hash === hash) target.scrollIntoView({ block: 'start' })
    else void router.push({ hash })
  }

  const backToTop = () => {
    const title = contentRef.value?.closest('article')?.querySelector<HTMLElement>('.article-header h1')
    title?.setAttribute('tabindex', '-1')
    title?.focus({ preventScroll: true })
    if (router.currentRoute.value.hash) void router.replace({ hash: '' })
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  const enhanceContent = async () => {
    syncToc()
    await nextTick()
    if (disposed) return
    trackHeadings()
    contentRef.value?.querySelectorAll<HTMLElement>('table, .katex-display').forEach((element) => {
      element.tabIndex = 0
      element.setAttribute('aria-label', element.tagName === 'TABLE' ? '数据表格，可横向滚动' : '数学公式，可横向滚动')
    })
  }

  onMounted(enhanceContent)
  watch(contentKey, enhanceContent, { flush: 'post' })

  onBeforeUnmount(() => {
    disposed = true
    disconnectHeadings()
  })

  return {
    tocItems,
    activeHeadingId,
    shouldShowToc,
    scrollToHeading,
    progress,
    showTop,
    headerHeight,
    backToTop
  }
}
