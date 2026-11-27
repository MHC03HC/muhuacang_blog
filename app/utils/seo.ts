export const siteOrigin = 'https://www.muhuacang.cn'

export const siteName = '阿木木的技术博客'

export const seoConfig = {
  siteName,
  siteNameEn: 'Amumu Notes',
  subtitle: '个人技术博客',
  author: '阿木木',
  lang: 'zh-CN',
  defaultDescription: '记录科研项目、算法学习、Linux 折腾和工程实践的个人技术博客。',
  defaultKeywords: ['MoE', '强化学习', '点云处理', '具身智能', 'Linux', 'Fedora', '科研笔记'],
  defaultOgSiteName: siteName,
  defaultOgImage: '',
  defaultTwitterImage: '',
  pages: {
    home: {
      title: siteName,
      description: '一个记录学习、项目和踩坑过程的个人技术博客。',
      keywords: ['科研项目', '算法笔记', '论文阅读', 'Linux', 'MoE', '强化学习', '点云处理', '具身智能']
    },
    blog: {
      title: '博客文章',
      description: '这里汇总了我的科研项目记录、算法笔记、Linux 使用笔记与工程实践总结。',
      keywords: ['博客文章', '科研项目', '算法笔记', 'Linux', '工程实践']
    },
    wiki: {
      title: 'Wiki',
      description: '这里整理我在工程学习、科研项目和技术实践中反复用到的知识点。',
      keywords: ['Wiki', '知识库', '工程学习', '科研项目', '技术实践']
    },
    projects: {
      title: '科研与工程项目',
      description: '记录公开的科研探索、算法学习与工程实践，涵盖项目背景、技术方案和阶段进展。',
      keywords: ['科研项目', '工程实践', '算法学习']
    },
    about: {
      title: '关于我',
      description: '了解阿木木当前关注的工程控制、智能算法、科研项目实践以及这座个人技术博客的记录方向。',
      keywords: ['关于我', '工程控制', '智能算法', '科研项目', '个人技术博客']
    }
  }
}

export const joinKeywords = (keywords?: string[]) => {
  return (keywords || []).filter(Boolean).join(', ')
}

// The public origin is independent of the host serving a preview or a crawl.
export function canonicalUrl(path: string, siteUrl = siteOrigin) {
  const base = new URL(siteUrl || siteOrigin)
  if (base.href !== siteOrigin + '/') throw new Error(`NUXT_PUBLIC_SITE_URL 应为 ${siteOrigin}`)
  const url = new URL(path, base)
  if (url.origin !== base.origin) throw new Error(`非站内 URL：${path}`)
  return base.origin + (url.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/')
}

export function isIndexable(robots: unknown) {
  return typeof robots !== 'string' || !robots.toLowerCase().split(/[,\s]+/).some(value => value === 'noindex' || value === 'none')
}

export type PageSeo = {
  path: string
  title: string
  description: string
  keywords?: string[]
  type?: 'website' | 'article' | 'profile'
  robots?: string
  schema?: 'BlogPosting' | 'TechArticle' | 'WebSite' | 'CollectionPage' | 'CreativeWork'
  image?: string
  author?: string
  published?: string
  modified?: string
}

export function structuredData(page: PageSeo, url: string) {
  if (!page.schema || !isIndexable(page.robots)) return
  const base = {
    '@context': 'https://schema.org', '@type': page.schema,
    url, description: page.description, inLanguage: seoConfig.lang
  }
  if (page.schema === 'CreativeWork') return { ...base, name: page.title,
    ...(page.modified && { dateModified: page.modified }), ...(page.image && { image: new URL(page.image, url).href }) }
  if (page.schema === 'WebSite' || page.schema === 'CollectionPage') return { ...base, name: page.title }
  return {
    ...base, headline: page.title, mainEntityOfPage: url,
    author: { '@type': 'Person', name: page.author || seoConfig.author },
    ...(page.published && { datePublished: page.published }),
    ...(page.modified && { dateModified: page.modified })
  }
}

export function serializeJsonLd(value: NonNullable<ReturnType<typeof structuredData>>) {
  // In a script element the HTML parser recognizes a closing tag even inside a JSON string.
  return JSON.stringify(value).replace(/</g, '\\u003c')
}
