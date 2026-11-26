<script setup lang="ts">
import type { PageCollectionItemBase } from '@nuxt/content'

const props = defineProps<{ value: PageCollectionItemBase & { slug: string } }>()
// rehype-katex emits a MathML <math> element for inline and display formulas.
const containsMath = (node: unknown): boolean =>
  Array.isArray(node) && (node[0] === 'math' || node.some(containsMath))
const needsMathStyles = computed(() => {
  const body = props.value.body
  return body.type !== 'minimark' || containsMath(body.value)
})

const bodyRef = ref<HTMLElement | null>(null)
const { tocItems, activeHeadingId, shouldShowToc, scrollToHeading, progress, showTop, headerHeight, backToTop } = useContentEnhancements(
  bodyRef,
  () => props.value.slug,
  () => props.value.body
)
</script>

<template>
  <div class="article-layout" :class="{ 'has-toc': shouldShowToc }"
    :style="headerHeight ? { '--reader-header': `${headerHeight}px` } : undefined">
    <div class="reading-progress" role="progressbar" aria-label="正文阅读进度"
      aria-valuemin="0" aria-valuemax="100" :aria-valuenow="Math.floor(progress * 100)">
      <span :style="{ transform: `scaleX(${progress})` }" />
    </div>
    <Teleport v-if="showTop" to="#article-top-action">
      <button type="button" class="theme-toggle article-top-button" aria-label="返回顶部" title="返回顶部" @click="backToTop">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M12 20V6m-7 7 7-7 7 7M4 3h16" />
        </svg>
      </button>
    </Teleport>
    <ArticleToc
      v-if="shouldShowToc"
      :items="tocItems"
      :active-heading-id="activeHeadingId"
      @navigate="scrollToHeading"
    />
    <div ref="bodyRef" class="article-body">
      <ContentRenderer :value="value" />
    </div>
    <LazyArticleMathStyles v-if="needsMathStyles" />
  </div>
</template>
