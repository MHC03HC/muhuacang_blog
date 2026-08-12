<script setup lang="ts">
import { formatReadingTime } from '~/utils/readingTime'
import { formatChineseDate } from '~/utils/date'
import { joinKeywords, resolveAbsoluteUrl, resolveImageUrl, seoConfig, useSiteUrl } from '~/utils/seo'

const route = useRoute()
const siteUrl = useSiteUrl()
const slug = computed(() => String(route.params.slug || ''))
const articleBodyRef = ref<HTMLElement | null>(null)

const { data: post } = await useAsyncData(
  () => `post-${slug.value}`,
  async () => {
    return await queryCollection('posts')
      .where('slug', '=', slug.value)
      .first()
  }
)

const { data: adjacentPosts } = await usePostSummaries()

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
  return resolveImageUrl(seoConfig.defaultOgImage || seoConfig.defaultTwitterImage, siteUrl)
})

const articleCanonical = computed(() => {
  return resolveAbsoluteUrl(`/blog/${slug.value}`, siteUrl)
})

const readingTimeText = computed(() => formatReadingTime(post.value?.body || ''))

const currentPostIndex = computed(() => {
  return (adjacentPosts.value || []).findIndex((item) => item.slug === post.value?.slug)
})

const previousPost = computed(() => {
  const index = currentPostIndex.value
  if (index <= 0) return null
  return adjacentPosts.value?.[index - 1] || null
})

const nextPost = computed(() => {
  const index = currentPostIndex.value
  if (index < 0 || index >= (adjacentPosts.value?.length || 0) - 1) return null
  return adjacentPosts.value?.[index + 1] || null
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

const {
  tocItems,
  activeHeadingId,
  shouldShowToc,
  scrollToHeading
} = useContentEnhancements(
  articleBodyRef,
  () => post.value?.slug,
  () => post.value?.body?.toc?.links
)
</script>

<template>
  <article v-if="post" class="site-container article-shell">
    <NuxtLink to="/blog" class="back-link">返回博客列表</NuxtLink>

    <header class="article-header">
      <p class="section-kicker">文章</p>
      <h1>{{ post.title }}</h1>
      <div class="article-meta">
        <time :datetime="post.date">{{ formatChineseDate(post.date) }}</time>
        <span>{{ post.author }}</span>
        <span class="reading-time">{{ readingTimeText }}</span>
      </div>
      <p class="article-description">{{ post.description }}</p>
    </header>

    <div class="article-layout">
      <ArticleToc
        v-if="shouldShowToc"
        :items="tocItems"
        :active-heading-id="activeHeadingId"
        @navigate="scrollToHeading"
      />

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
