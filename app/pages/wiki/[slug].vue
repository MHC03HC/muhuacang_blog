<script setup lang="ts">
import { joinKeywords, resolveAbsoluteUrl, resolveImageUrl, seoConfig } from '~/utils/seo'

type TocItem = {
  id: string
  text: string
  level: 'h2' | 'h3'
}

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const articleBodyRef = ref<HTMLElement | null>(null)
const tocItems = ref<TocItem[]>([])
const activeHeadingId = ref('')
let headingObserver: IntersectionObserver | null = null
let codeCopyResetTimers: number[] = []
let codeBlockCleanupCallbacks: Array<() => void> = []

const { data: entry } = await useAsyncData(
  () => `wiki-${slug.value}`,
  async () => {
    return await queryCollection('wiki')
      .where('slug', '=', slug.value)
      .first()
  }
)

const { data: allWikiEntries } = await useAsyncData('all-wiki-entries', async () => {
  return await queryCollection('wiki')
    .select('title', 'slug', 'description', 'updated')
    .all()
})

if (!entry.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Wiki 条目不存在',
    fatal: true
  })
}

const entryDescription = computed(() => entry.value?.description || seoConfig.defaultDescription)
const entryKeywords = computed(() => {
  const values = [entry.value?.title, entry.value?.category, ...(entry.value?.tags || [])]
  return values.filter(Boolean) as string[]
})
const entryImage = computed(() => resolveImageUrl(seoConfig.defaultOgImage || seoConfig.defaultTwitterImage))
const canonical = computed(() => resolveAbsoluteUrl(`/wiki/${slug.value}`))

useHead(() => ({
  title: entry.value?.title || 'Wiki',
  meta: [
    {
      name: 'description',
      content: entryDescription.value
    },
    {
      name: 'keywords',
      content: joinKeywords(entryKeywords.value.length ? entryKeywords.value : seoConfig.defaultKeywords)
    },
    {
      property: 'og:type',
      content: 'article'
    },
    {
      property: 'og:title',
      content: entry.value?.title || 'Wiki'
    },
    {
      property: 'og:description',
      content: entryDescription.value
    },
    {
      name: 'twitter:card',
      content: entryImage.value ? 'summary_large_image' : 'summary'
    },
    {
      name: 'twitter:title',
      content: entry.value?.title || 'Wiki'
    },
    {
      name: 'twitter:description',
      content: entryDescription.value
    }
  ].concat(entryImage.value
    ? [
        { property: 'og:image', content: entryImage.value },
        { name: 'twitter:image', content: entryImage.value }
      ]
    : []),
  link: canonical.value
    ? [{ rel: 'canonical', href: canonical.value }]
    : []
}))

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const shouldShowToc = computed(() => tocItems.value.length >= 2)

const relatedEntries = computed(() => {
  const relatedSlugs = entry.value?.related || []
  if (!relatedSlugs.length) return []

  const relatedSet = new Set(relatedSlugs)
  return (allWikiEntries.value || []).filter((item) => relatedSet.has(item.slug))
})

const slugifyHeading = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s/]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const disconnectHeadingObserver = () => {
  headingObserver?.disconnect()
  headingObserver = null
}

const cleanupCodeBlockEnhancements = () => {
  codeBlockCleanupCallbacks.forEach((callback) => callback())
  codeBlockCleanupCallbacks = []

  codeCopyResetTimers.forEach((timer) => window.clearTimeout(timer))
  codeCopyResetTimers = []
}

const observeHeadings = () => {
  disconnectHeadingObserver()

  if (!import.meta.client || tocItems.value.length < 2) return

  const headings = articleBodyRef.value?.querySelectorAll<HTMLElement>('h2[id], h3[id]')
  if (!headings?.length) return

  headingObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visibleEntries.length) {
        activeHeadingId.value = visibleEntries[0].target.id
      }
    },
    {
      rootMargin: '-18% 0px -68% 0px',
      threshold: [0, 1]
    }
  )

  headings.forEach((heading) => headingObserver?.observe(heading))
}

const buildToc = async () => {
  if (!import.meta.client) return

  await nextTick()

  const headings = articleBodyRef.value?.querySelectorAll<HTMLElement>('h2, h3') || []
  const nextItems: TocItem[] = []
  const usedIds = new Set<string>()

  headings.forEach((heading) => {
    const text = heading.textContent?.trim()
    if (!text) return

    const baseId = slugifyHeading(text) || heading.tagName.toLowerCase()
    let nextId = baseId
    let index = 2

    while (usedIds.has(nextId)) {
      nextId = `${baseId}-${index}`
      index += 1
    }

    usedIds.add(nextId)
    heading.id = nextId

    nextItems.push({
      id: nextId,
      text,
      level: heading.tagName.toLowerCase() as 'h2' | 'h3'
    })
  })

  tocItems.value = nextItems
  activeHeadingId.value = nextItems[0]?.id || ''
  observeHeadings()
}

const scrollToHeading = (id: string) => {
  if (!import.meta.client) return

  const target = document.getElementById(id)
  if (!target) return

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })

  activeHeadingId.value = id
}

const enhanceCodeBlocks = async () => {
  if (!import.meta.client) return

  await nextTick()
  cleanupCodeBlockEnhancements()

  const preElements = articleBodyRef.value?.querySelectorAll<HTMLPreElement>('pre') || []

  preElements.forEach((pre) => {
    if (pre.parentElement?.classList.contains('code-block-shell')) return

    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-shell'

    pre.parentNode?.insertBefore(wrapper, pre)
    wrapper.appendChild(pre)

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'code-copy-button'
    button.textContent = '复制代码'
    button.setAttribute('aria-label', '复制当前代码块')
    wrapper.appendChild(button)

    const handleCopy = async () => {
      const codeText = pre.querySelector('code')?.textContent || pre.textContent || ''
      if (!codeText.trim()) return

      try {
        await navigator.clipboard.writeText(codeText)
        button.textContent = '已复制'
        button.classList.add('is-copied')

        const timer = window.setTimeout(() => {
          button.textContent = '复制代码'
          button.classList.remove('is-copied')
        }, 1600)

        codeCopyResetTimers.push(timer)
      } catch {
        button.textContent = '复制失败'
        const timer = window.setTimeout(() => {
          button.textContent = '复制代码'
        }, 1600)

        codeCopyResetTimers.push(timer)
      }
    }

    button.addEventListener('click', handleCopy)

    codeBlockCleanupCallbacks.push(() => {
      button.removeEventListener('click', handleCopy)
    })
  })
}

const enhanceArticleContent = async () => {
  await buildToc()
  await enhanceCodeBlocks()
}

onMounted(() => {
  enhanceArticleContent()
})

watch(
  () => entry.value?.slug,
  () => {
    enhanceArticleContent()
  }
)

onBeforeUnmount(() => {
  disconnectHeadingObserver()
  cleanupCodeBlockEnhancements()
})
</script>

<template>
  <article v-if="entry" class="site-container article-shell">
    <NuxtLink to="/wiki" class="back-link">返回 Wiki</NuxtLink>

    <header class="article-header">
      <p class="section-kicker">Wiki</p>
      <h1>{{ entry.title }}</h1>
      <div class="article-meta">
        <time :datetime="entry.updated">{{ formatDate(entry.updated) }}</time>
      </div>
      <p class="article-description">{{ entry.description }}</p>
    </header>

    <div class="article-layout">
      <aside v-if="shouldShowToc" class="article-toc">
        <div class="article-toc-card">
          <p class="article-toc-title">文章目录</p>
          <nav aria-label="文章目录">
            <button
              v-for="item in tocItems"
              :key="item.id"
              type="button"
              class="article-toc-link"
              :class="[
                `is-${item.level}`,
                { 'is-active': activeHeadingId === item.id }
              ]"
              @click="scrollToHeading(item.id)"
            >
              {{ item.text }}
            </button>
          </nav>
        </div>
      </aside>

      <div ref="articleBodyRef" class="article-body">
        <ContentRenderer :value="entry" />
      </div>
    </div>

    <section v-if="relatedEntries.length" class="home-section">
      <div class="section-head">
        <div>
          <p class="section-kicker">相关条目</p>
          <h2>相关条目</h2>
        </div>
      </div>

      <div class="post-grid">
        <WikiCard v-for="item in relatedEntries" :key="item.slug" :item="item" />
      </div>
    </section>

    <NuxtLink to="/wiki" class="back-link">返回 Wiki 首页</NuxtLink>
  </article>
</template>
