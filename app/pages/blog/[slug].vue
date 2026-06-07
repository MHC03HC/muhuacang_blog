<script setup lang="ts">
import { formatReadingTime } from '~/utils/readingTime'
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

const { data: post } = await useAsyncData(
  () => `post-${slug.value}`,
  async () => {
    return await queryCollection('posts')
      .where('slug', '=', slug.value)
      .first()
  }
)

const { data: adjacentPosts } = await useAsyncData('adjacent-posts', async () => {
  return await queryCollection('posts')
    .select('title', 'slug', 'date')
    .all()
})

if (!post.value) {
  throw createError({
    statusCode: 404,
    statusMessage: '文章不存在',
    fatal: true
  })
}

const articleDescription = computed(() => {
  return post.value?.description || post.value?.excerpt || seoConfig.defaultDescription
})

const articleKeywords = computed(() => {
  return post.value?.tags?.length ? post.value.tags : seoConfig.defaultKeywords
})

const articleImage = computed(() => {
  return resolveImageUrl(seoConfig.defaultOgImage || seoConfig.defaultTwitterImage)
})

const articleCanonical = computed(() => {
  return resolveAbsoluteUrl(`/blog/${slug.value}`)
})

const readingTimeText = computed(() => formatReadingTime(post.value?.body || ''))

const sortedAdjacentPosts = computed(() => {
  return [...(adjacentPosts.value || [])]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const currentPostIndex = computed(() => {
  return sortedAdjacentPosts.value.findIndex((item) => item.slug === post.value?.slug)
})

const previousPost = computed(() => {
  const index = currentPostIndex.value
  if (index <= 0) return null
  return sortedAdjacentPosts.value[index - 1] || null
})

const nextPost = computed(() => {
  const index = currentPostIndex.value
  if (index < 0 || index >= sortedAdjacentPosts.value.length - 1) return null
  return sortedAdjacentPosts.value[index + 1] || null
})

useHead(() => ({
  title: post.value?.title || '文章',
  meta: [
    {
      name: 'description',
      content: articleDescription.value
    },
    {
      name: 'keywords',
      content: joinKeywords(articleKeywords.value)
    },
    {
      property: 'og:type',
      content: 'article'
    },
    {
      property: 'og:title',
      content: post.value?.title || '文章'
    },
    {
      property: 'og:description',
      content: articleDescription.value
    },
    {
      name: 'twitter:card',
      content: articleImage.value ? 'summary_large_image' : 'summary'
    },
    {
      name: 'twitter:title',
      content: post.value?.title || '文章'
    },
    {
      name: 'twitter:description',
      content: articleDescription.value
    }
  ].concat(articleImage.value
    ? [
        { property: 'og:image', content: articleImage.value },
        { name: 'twitter:image', content: articleImage.value }
      ]
    : []),
  link: articleCanonical.value
    ? [{ rel: 'canonical', href: articleCanonical.value }]
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
  () => post.value?.slug,
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
  <article v-if="post" class="site-container article-shell">
    <NuxtLink to="/blog" class="back-link">返回博客列表</NuxtLink>

    <header class="article-header">
      <p class="section-kicker">文章</p>
      <h1>{{ post.title }}</h1>
      <div class="article-meta">
        <time :datetime="post.date">{{ formatDate(post.date) }}</time>
        <span>{{ post.author }}</span>
        <span class="reading-time">{{ readingTimeText }}</span>
      </div>
      <p class="article-description">{{ post.description }}</p>
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
        <ContentRenderer :value="post" />
      </div>
    </div>

    <section class="article-pagination">
      <NuxtLink v-if="previousPost" :to="`/blog/${previousPost.slug}`" class="article-pagination-card is-prev">
        <span class="article-pagination-label">上一篇</span>
        <strong>{{ previousPost.title }}</strong>
      </NuxtLink>

      <NuxtLink to="/blog" class="article-pagination-center">
        返回全部文章
      </NuxtLink>

      <NuxtLink v-if="nextPost" :to="`/blog/${nextPost.slug}`" class="article-pagination-card is-next">
        <span class="article-pagination-label">下一篇</span>
        <strong>{{ nextPost.title }}</strong>
      </NuxtLink>
    </section>
  </article>
</template>
