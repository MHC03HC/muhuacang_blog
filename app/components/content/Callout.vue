<script setup lang="ts">
const props = defineProps<{ type?: string }>()
const kinds = {
  note: { label: '说明', icon: 'ⓘ' },
  tip: { label: '技巧', icon: '✦' },
  warning: { label: '警告', icon: '⚠' },
  important: { label: '重要', icon: '◆' }
} as const
const kind = computed(() => {
  const key = props.type?.toLowerCase() || 'note'
  return Object.hasOwn(kinds, key) ? key as keyof typeof kinds : 'note'
})
</script>

<template>
  <aside class="article-callout" :data-kind="kind" role="note" :aria-label="kinds[kind].label">
    <strong><span aria-hidden="true">{{ kinds[kind].icon }}</span> {{ kinds[kind].label }}</strong>
    <slot />
  </aside>
</template>
