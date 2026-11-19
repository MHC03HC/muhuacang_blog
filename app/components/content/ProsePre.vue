<script setup lang="ts">
import { languageLabel } from '~/utils/codeLanguage'

defineOptions({ inheritAttrs: false })
const props = defineProps<{
  code?: string
  language?: string
  filename?: string
  highlights?: number[]
  meta?: string
}>()

const pre = ref<HTMLPreElement>()
const copyLabel = ref('复制代码')
let timer: ReturnType<typeof setTimeout>
let disposed = false

async function copyCode() {
  clearTimeout(timer)
  try {
    await navigator.clipboard.writeText(props.code ?? pre.value?.textContent ?? '')
    copyLabel.value = '已复制'
  } catch {
    copyLabel.value = '复制失败，请手动选择'
  }
  if (!disposed) timer = setTimeout(() => { copyLabel.value = '复制代码' }, 2000)
}

onBeforeUnmount(() => {
  disposed = true
  clearTimeout(timer)
})
</script>

<template>
  <LazyArticleDiagram v-if="language === 'mermaid' && code != null" :key="code" :source="code" :filename="filename" />
  <div v-else class="code-block-shell">
    <div class="code-toolbar">
      <span v-if="filename" class="code-filename">{{ filename }}</span>
      <span v-if="language" class="code-language">{{ languageLabel(language) }}</span>
      <button type="button" class="code-copy-button" :class="{ 'is-copied': copyLabel === '已复制' }"
        aria-label="复制当前代码块" aria-live="polite" @click="copyCode">{{ copyLabel }}</button>
    </div>
    <pre ref="pre" v-bind="$attrs" tabindex="0" aria-label="代码块，可横向滚动"><slot /></pre>
  </div>
</template>
