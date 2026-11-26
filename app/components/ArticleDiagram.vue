<script setup lang="ts">
const props = defineProps<{ source: string, filename?: string }>()
const theme = useResolvedTheme()
const figure = ref<HTMLElement>()
const host = ref<HTMLElement>()
const near = ref(false)
type Picture = { url: string, width: number, alt: string }
const picture = shallowRef<Picture>()
const variants = new Map<string, Picture>()
const error = ref('')
const id = `diagram-${useId()}`
let observer: IntersectionObserver | undefined
let visibilityTimer: ReturnType<typeof setTimeout>
let renderedTheme: string | undefined

function showPicture(next: Picture, color: string) {
  if (picture.value && !variants.has(renderedTheme || '')) URL.revokeObjectURL(picture.value.url)
  picture.value = next
  renderedTheme = color
}

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    // A fast scroll can cross several diagrams in one frame. Start expensive
    // layout only when the reader stays near this diagram.
    clearTimeout(visibilityTimer)
    if (entry?.isIntersecting) visibilityTimer = setTimeout(() => { near.value = true }, 120)
    else near.value = false
  }, { rootMargin: '250px' })
  observer.observe(figure.value!)
})

watch([near, theme], async ([visible, color], _, onCleanup) => {
  if (!visible || !host.value || renderedTheme === color || error.value) return
  const cached = variants.get(color)
  if (cached) {
    showPicture(cached, color)
    return
  }
  let current = true
  onCleanup(() => { current = false })
  try {
    // Untrusted diagrams may describe nodes and edges, but cannot configure the renderer.
    if (/^\s*---(?:\s|$)|%%\s*\{/m.test(props.source)) {
      throw new Error('文章图表不支持内嵌配置。')
    }
    const { renderMermaid } = await import('~/utils/renderMermaid')
    if (!current || !host.value) return
    const svg = await renderMermaid(id, props.source, color, host.value, () => current)
    if (!svg || !current) return
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml')
    const root = doc.documentElement
    if (root.localName !== 'svg') throw new Error('无效的 SVG。')
    const width = Number(root.getAttribute('viewBox')?.trim().split(/[\s,]+/)[2]) || 0
    // Image embedding keeps generated SVG outside the page's active DOM.
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const next = { url: URL.createObjectURL(blob), width, alt: doc.querySelector('title')?.textContent || props.filename || 'Mermaid 技术图表' }
    if (blob.size <= 128 * 1024) variants.set(color, next)
    showPicture(next, color)
  } catch (cause) {
    if (current) error.value = cause instanceof Error ? cause.message.split('\n')[0] || '语法错误' : '渲染失败'
  }
}, { flush: 'post' })

onBeforeUnmount(() => {
  observer?.disconnect()
  clearTimeout(visibilityTimer)
  for (const variant of variants.values()) URL.revokeObjectURL(variant.url)
  if (picture.value && !variants.has(renderedTheme || '')) URL.revokeObjectURL(picture.value.url)
})
</script>

<template>
  <figure ref="figure" class="article-diagram">
    <figcaption v-if="filename">{{ filename }}</figcaption>
    <p v-if="error" role="status">Mermaid 图表未能渲染，已保留源码。{{ error }}</p>
    <div v-if="picture && !error" class="diagram-viewport" tabindex="0" aria-label="图表，可横向滚动">
      <img :src="picture.url" :alt="picture.alt"
        :style="picture.width ? { width: `${picture.width}px`, minWidth: `${picture.width * 0.65}px` } : undefined">
    </div>
    <pre v-else tabindex="0" aria-label="Mermaid 图表源码"><code>{{ source }}</code></pre>
    <div ref="host" class="diagram-measure" aria-hidden="true" inert />
  </figure>
</template>
