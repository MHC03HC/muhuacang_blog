<script setup lang="ts">
import MdcImage from '@nuxtjs/mdc/runtime/components/prose/ProseImg.vue'

defineOptions({ inheritAttrs: false })
defineProps<{ src?: string }>()
const baseURL = useRuntimeConfig().app.baseURL
</script>

<template>
  <picture v-if="src === '/images/wiki/cpp/keyboard.png'">
    <source :srcset="`${baseURL}images/wiki/cpp/keyboard.webp`" type="image/webp">
    <MdcImage :src="src" width="1496" height="934" loading="lazy" decoding="async" v-bind="$attrs" />
  </picture>
  <MdcImage v-else :src="src" v-bind="$attrs" />
</template>
