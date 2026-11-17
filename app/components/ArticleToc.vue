<script setup lang="ts">
import type { ContentTocItem } from '~/composables/useContentEnhancements'
import { buildTocRows, visibleTocRows } from '~/utils/contentToc'

const props = defineProps<{
  items: ContentTocItem[]
  activeHeadingId: string
}>()

const emit = defineEmits<{
  navigate: [id: string]
}>()

const expanded = ref(false)
const collapsed = ref(new Set<string>())
const rows = computed(() => buildTocRows(props.items))
const branches = computed(() => rows.value.filter((row) => row.hasChildren))
const visibleRows = computed(() => visibleTocRows(rows.value, collapsed.value))

const toggleBranch = (id: string) => {
  const next = new Set(collapsed.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  collapsed.value = next
}

const expandAll = () => { collapsed.value = new Set() }
const collapseAll = () => {
  collapsed.value = new Set(branches.value.map((row) => row.id))
}

watch(() => props.items, () => {
  collapsed.value = new Set()
  expanded.value = false
})

const navigate = async (id: string) => {
  expanded.value = false
  await nextTick()
  emit('navigate', id)
}
</script>

<template>
  <aside v-if="items.length >= 2" class="article-toc">
    <div class="article-toc-card">
      <p class="article-toc-title article-toc-desktop-title">文章目录</p>
      <button
        type="button"
        class="article-toc-toggle"
        :aria-expanded="expanded"
        aria-controls="article-toc-links"
        @click="expanded = !expanded"
      >
        <span>文章目录 · {{ items.length }} 节</span>
        <span aria-hidden="true">{{ expanded ? '收起 −' : '展开 +' }}</span>
      </button>
      <nav id="article-toc-links" aria-label="文章目录" :class="{ 'is-expanded': expanded }">
        <div v-if="branches.length" class="article-toc-tools">
          <button type="button" :disabled="!collapsed.size" @click="expandAll">全部展开</button>
          <button type="button" :disabled="collapsed.size === branches.length" @click="collapseAll">全部折叠</button>
        </div>
        <div
          v-for="item in visibleRows"
          :key="item.id"
          class="article-toc-row"
          :style="{ '--toc-indent': `${item.ancestors.length * 0.65}rem` }"
        >
          <button
            v-if="item.hasChildren"
            type="button"
            class="article-toc-branch"
            :aria-expanded="!collapsed.has(item.id)"
            :aria-label="`${collapsed.has(item.id) ? '展开' : '折叠'}：${item.text}`"
            @click="toggleBranch(item.id)"
          >
            <span aria-hidden="true">{{ collapsed.has(item.id) ? '▸' : '▾' }}</span>
          </button>
          <span v-else class="article-toc-spacer" aria-hidden="true" />
          <a
            :href="`#${item.id}`"
            :aria-current="activeHeadingId === item.id ? 'location' : undefined"
            class="article-toc-link"
            :class="{ 'is-active': activeHeadingId === item.id }"
            @click.prevent="navigate(item.id)"
          >
            {{ item.text }}
          </a>
        </div>
      </nav>
    </div>
  </aside>
</template>
