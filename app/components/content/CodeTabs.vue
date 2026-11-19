<script setup lang="ts">
import { languageLabel } from '~/utils/codeLanguage'

const slots = useSlots()
const names = computed(() => Object.keys(slots).filter(name => name !== 'default'))
const selected = ref(0)
const group = useId()

function navigate(event: KeyboardEvent, index: number) {
  const count = names.value.length
  let next: number
  switch (event.key) {
    case 'ArrowRight': next = (index + 1) % count; break
    case 'ArrowLeft': next = (index + count - 1) % count; break
    case 'Home': next = 0; break
    case 'End': next = count - 1; break
    default: return
  }
  event.preventDefault()
  selected.value = next
  document.getElementById(`${group}-tab-${next}`)?.focus()
}
</script>

<template>
  <div class="code-tabs">
    <div v-if="names.length" class="code-tab-list" role="tablist" aria-label="代码语言">
      <button v-for="(name, i) in names" :id="`${group}-tab-${i}`" :key="name" type="button"
        role="tab" :aria-controls="`${group}-panel-${i}`" :aria-selected="i === selected"
        :tabindex="i === selected ? 0 : -1" @click="selected = i" @keydown="navigate($event, i)">
        {{ languageLabel(name) }}
      </button>
    </div>
    <div v-for="(name, i) in names" :id="`${group}-panel-${i}`" :key="name"
      role="tabpanel" :aria-labelledby="`${group}-tab-${i}`" :hidden="i !== selected" tabindex="0">
      <slot :name="name" />
    </div>
    <slot />
  </div>
</template>
