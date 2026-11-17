import type { Ref } from 'vue'

import { collectTocItems, type ContentTocItem } from '~/utils/contentToc'

export const useContentEnhancements = (
  contentRef: Ref<HTMLElement | null>,
  contentKey: () => unknown,
  bodySource: () => unknown
) => {
  const tocItems = ref<ContentTocItem[]>(collectTocItems(bodySource()))
  const activeHeadingId = ref(tocItems.value[0]?.id || '')
  const shouldShowToc = computed(() => tocItems.value.length >= 2)

  let headingCleanup: (() => void) | null = null
  let scrollFrame = 0
  let disposed = false
  let codeBlockCleanupCallbacks: Array<() => void> = []

  const disconnectHeadings = () => {
    headingCleanup?.()
    headingCleanup = null
    if (scrollFrame) cancelAnimationFrame(scrollFrame)
    scrollFrame = 0
  }

  const cleanupCodeBlocks = () => {
    codeBlockCleanupCallbacks.forEach((callback) => callback())
    codeBlockCleanupCallbacks = []

  }

  const trackHeadings = () => {
    disconnectHeadings()

    if (!import.meta.client || tocItems.value.length < 2) return

    const headings = contentRef.value?.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
    if (!headings?.length) return

    // Recompute from all headings, including those above the viewport. This stays
    // correct through long code blocks, fast scrolls and scrolling backwards.
    const update = () => {
      scrollFrame = 0
      const offset = (document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0) + 24
      contentRef.value?.style.setProperty('--heading-offset', `${offset}px`)
      let current = headings[0]!.id
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= offset + 1) current = heading.id
        else break
      }
      activeHeadingId.value = current
    }
    const schedule = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()
    headingCleanup = () => {
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

    const offset = (document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0) + 24
    target.style.scrollMarginTop = `${offset}px`
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
    window.history.replaceState(window.history.state, '', `#${encodeURIComponent(id)}`)
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    })
    activeHeadingId.value = id
  }

  const enhanceCodeBlocks = async () => {
    if (!import.meta.client) return

    await nextTick()
    if (disposed) return
    cleanupCodeBlocks()

    const preElements = contentRef.value?.querySelectorAll<HTMLPreElement>('pre') || []

    preElements.forEach((pre) => {
      let wrapper = pre.parentElement

      if (!wrapper?.classList.contains('code-block-shell')) {
        wrapper = document.createElement('div')
        wrapper.className = 'code-block-shell'
        pre.parentNode?.insertBefore(wrapper, pre)
        wrapper.appendChild(pre)
      }

      let button = wrapper.querySelector<HTMLButtonElement>('.code-copy-button')

      if (!button) {
        button = document.createElement('button')
        button.type = 'button'
        button.className = 'code-copy-button'
        button.setAttribute('aria-label', '复制当前代码块')
        wrapper.appendChild(button)
      }

      button.setAttribute('aria-live', 'polite')
      button.textContent = '复制代码'
      button.classList.remove('is-copied')

      let resetTimer: number | undefined
      const reset = () => {
        if (!button) return
        button.textContent = '复制代码'
        button.classList.remove('is-copied')
      }
      const handleCopy = async () => {
        const codeText = pre.querySelector('code')?.textContent || pre.textContent || ''
        if (!codeText.trim() || !button) return
        window.clearTimeout(resetTimer)
        try {
          await navigator.clipboard.writeText(codeText)
          if (disposed) return
          button.textContent = '已复制'
          button.classList.add('is-copied')
        } catch {
          if (disposed) return
          button.textContent = '复制失败，请手动选择'
          button.classList.remove('is-copied')
        }
        resetTimer = window.setTimeout(reset, 2000)
      }

      pre.tabIndex = 0
      pre.setAttribute('aria-label', '代码块，可横向滚动')
      button.addEventListener('click', handleCopy)
      codeBlockCleanupCallbacks.push(() => {
        window.clearTimeout(resetTimer)
        button?.removeEventListener('click', handleCopy)
      })
    })
  }

  const enhanceContent = async () => {
    syncToc()
    await nextTick()
    if (disposed) return
    trackHeadings()
    await enhanceCodeBlocks()
    if (disposed) return
    contentRef.value?.querySelectorAll<HTMLElement>('table, .katex-display').forEach((element) => {
      element.tabIndex = 0
      element.setAttribute('aria-label', element.tagName === 'TABLE' ? '数据表格，可横向滚动' : '数学公式，可横向滚动')
    })
  }

  onMounted(async () => {
    await enhanceContent()
    if (disposed) return
    if (window.location.hash) {
      try { scrollToHeading(decodeURIComponent(window.location.hash.slice(1))) } catch { /* Invalid external hash. */ }
    }
  })
  watch(contentKey, enhanceContent, { flush: 'post' })

  onBeforeUnmount(() => {
    disposed = true
    disconnectHeadings()
    cleanupCodeBlocks()
  })

  return {
    tocItems,
    activeHeadingId,
    shouldShowToc,
    scrollToHeading
  }
}
