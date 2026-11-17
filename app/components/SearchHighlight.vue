<script setup lang="ts">
import { highlightSearchText } from '~/utils/fullTextSearch'
const props = defineProps<{ text: string; query: string }>()
const parts = computed(() => highlightSearchText(props.text, props.query))
</script>

<template>
  <span><template v-for="(part, index) in parts" :key="index"><mark v-if="part.highlighted">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span>
</template>
