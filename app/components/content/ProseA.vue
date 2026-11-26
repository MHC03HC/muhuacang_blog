<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  href: {
    type: String,
    default: ''
  },
  target: {
    type: String as PropType<'_blank' | '_parent' | '_self' | '_top' | (string & object) | null | undefined>,
    default: undefined,
    required: false
  }
})

const safeHref = computed(() => {
  const value = props.href.trim()
  if (!value) return ''
  // Reject dangerous URI schemes (including ASCII control character obfuscation).
  const normalized = value.replace(/[\u0000-\u0020]+/g, '')
  if (/^(?:javascript|vbscript|data):/i.test(normalized)) return ''
  return value
})

const isHashOrExternal = computed(() => {
  const value = safeHref.value
  return !value || value.startsWith('#') || /^(?:https?:|mailto:|tel:|\/\/)/i.test(value)
})

const safeRel = computed(() => (props.target === '_blank' ? 'noopener noreferrer' : undefined))
</script>

<template>
  <a
    v-if="isHashOrExternal"
    :href="safeHref || undefined"
    :target="props.target || undefined"
    :rel="safeRel"
  >
    <slot />
  </a>
  <NuxtLink
    v-else
    :to="safeHref"
    :target="props.target || undefined"
  >
    <slot />
  </NuxtLink>
</template>
