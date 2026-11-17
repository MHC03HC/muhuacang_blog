import type { Ref } from 'vue'

export type ContentTocItem = {
  id: string
  text: string
  depth: number
}

// Nuxt Content stores rendered headings in its compact Markdown AST.
// Read the actual h1–h6 hierarchy so imported notes can retain chapter headings.
const collectTocItems = (body: unknown): ContentTocItem[] => {
  const items: Array<{ id: string; text: string; depth: number }> = []
  const textOf = (node: unknown): string => {
    if (typeof node === 'string') return node
    if (!Array.isArray(node)) return ''
    return node.slice(2).map(textOf).join('')
  }
  const visit = (node: unknown) => {
    if (!Array.isArray(node)) return
    const [tag, props] = node
    if (typeof tag === 'string' && /^h[1-6]$/.test(tag) && props?.id) {
      items.push({ id: String(props.id), text: textOf(node), depth: Number(tag[1]) })
      return
    }
    node.forEach(visit)
  }
  if (body && typeof body === 'object' && 'value' in body) {
    visit(body.value)
  }
  return items.map((item) => ({
    id: item.id,
    text: item.text,
    depth: item.depth
  }))
}

export const useContentEnhancements = (
  contentRef: Ref<HTMLElement | null>,
  contentKey: () => unknown,
  bodySource: () => unknown
) => {
  const tocItems = ref<ContentTocItem[]>(collectTocItems(bodySource()))
  const activeHeadingId = ref(tocItems.value[0]?.id || '')
  const shouldShowToc = computed(() => tocItems.value.length >= 2)

  let headingObserver: IntersectionObserver | null = null
  let codeCopyResetTimers: number[] = []
  let codeBlockCleanupCallbacks: Array<() => void> = []

  const disconnectHeadingObserver = () => {
    headingObserver?.disconnect()
    headingObserver = null
  }

  const cleanupCodeBlocks = () => {
    codeBlockCleanupCallbacks.forEach((callback) => callback())
    codeBlockCleanupCallbacks = []

    if (import.meta.client) {
      codeCopyResetTimers.forEach((timer) => window.clearTimeout(timer))
    }
    codeCopyResetTimers = []
  }

  const observeHeadings = () => {
    disconnectHeadingObserver()

    if (!import.meta.client || tocItems.value.length < 2) return

    const headings = contentRef.value?.querySelectorAll<HTMLElement>('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
    if (!headings?.length) return

    headingObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visibleEntries.length) {
          activeHeadingId.value = (visibleEntries[0].target as HTMLElement).id
        }
      },
      {
        rootMargin: '-18% 0px -68% 0px',
        threshold: [0, 1]
      }
    )

    headings.forEach((heading) => headingObserver?.observe(heading))
  }

  const syncToc = () => {
    tocItems.value = collectTocItems(bodySource())
    activeHeadingId.value = tocItems.value[0]?.id || ''
  }

  const scrollToHeading = (id: string) => {
    if (!import.meta.client) return

    const target = document.getElementById(id)
    if (!target) return

    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start'
    })
    activeHeadingId.value = id
  }

  const enhanceCodeBlocks = async () => {
    if (!import.meta.client) return

    await nextTick()
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

      button.textContent = '复制代码'
      button.classList.remove('is-copied')

      const handleCopy = async () => {
        const codeText = pre.querySelector('code')?.textContent || pre.textContent || ''
        if (!codeText.trim() || !button) return

        try {
          await navigator.clipboard.writeText(codeText)
          button.textContent = '已复制'
          button.classList.add('is-copied')

          const timer = window.setTimeout(() => {
            if (!button) return
            button.textContent = '复制代码'
            button.classList.remove('is-copied')
          }, 1600)
          codeCopyResetTimers.push(timer)
        } catch {
          button.textContent = '复制失败'
          const timer = window.setTimeout(() => {
            if (button) button.textContent = '复制代码'
          }, 1600)
          codeCopyResetTimers.push(timer)
        }
      }

      button.addEventListener('click', handleCopy)
      codeBlockCleanupCallbacks.push(() => button?.removeEventListener('click', handleCopy))
    })
  }

  const enhanceContent = async () => {
    syncToc()
    await nextTick()
    observeHeadings()
    await enhanceCodeBlocks()
  }

  onMounted(enhanceContent)
  watch(contentKey, enhanceContent, { flush: 'post' })

  onBeforeUnmount(() => {
    disconnectHeadingObserver()
    cleanupCodeBlocks()
  })

  return {
    tocItems,
    activeHeadingId,
    shouldShowToc,
    scrollToHeading
  }
}
