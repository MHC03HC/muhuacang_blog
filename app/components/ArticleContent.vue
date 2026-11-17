<script setup lang="ts">
const props = defineProps<{ value: Record<string, unknown> }>()
const bodyRef = ref<HTMLElement | null>(null)
const { tocItems, activeHeadingId, shouldShowToc, scrollToHeading } = useContentEnhancements(
  bodyRef,
  () => props.value.slug,
  () => props.value.body
)
</script>

<template>
  <div class="article-layout" :class="{ 'has-toc': shouldShowToc }">
    <ArticleToc
      v-if="shouldShowToc"
      :items="tocItems"
      :active-heading-id="activeHeadingId"
      @navigate="scrollToHeading"
    />
    <div ref="bodyRef" class="article-body">
      <ContentRenderer :value="value" />
    </div>
  </div>
</template>
