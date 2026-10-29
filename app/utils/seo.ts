import { useRuntimeConfig } from '#app'

export const seoConfig = {
  siteName: '阿木木的技术笔记',
  siteNameEn: 'Amumu Notes',
  subtitle: '个人技术博客',
  author: '阿木木',
  lang: 'zh-CN',
  defaultTitle: '阿木木的技术笔记',
  defaultDescription: '记录科研项目、算法学习、Linux 折腾和工程实践的个人技术博客。',
  defaultKeywords: ['MoE', '强化学习', '点云处理', '具身智能', 'Linux', 'Fedora', '科研笔记'],
  defaultOgTitle: '阿木木的技术笔记',
  defaultOgDescription: '记录科研项目、算法学习、Linux 折腾和工程实践的个人技术博客。',
  defaultOgSiteName: '阿木木的技术笔记',
  defaultOgImage: '',
  defaultTwitterTitle: '阿木木的技术笔记',
  defaultTwitterDescription: '记录科研项目、算法学习、Linux 折腾和工程实践的个人技术博客。',
  defaultTwitterImage: '',
  pages: {
    home: {
      description: '一个记录学习、项目和踩坑过程的个人技术博客。',
      keywords: ['科研项目', '算法笔记', '论文阅读', 'Linux', 'MoE', '强化学习', '点云处理', '具身智能']
    },
    blog: {
      title: '博客文章',
      description: '这里汇总了我的科研项目记录、算法笔记、Linux 使用笔记与工程实践总结。',
      keywords: ['博客文章', '科研项目', '算法笔记', 'Linux', '工程实践']
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

export const useSiteUrl = () => {
  const runtimeConfig = useRuntimeConfig()
  return String(runtimeConfig.public.siteUrl || '').trim()
}

export const resolveAbsoluteUrl = (path = '/', siteUrl = '') => {
  if (!siteUrl) return undefined

  const base = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`
  return new URL(path.replace(/^\//, ''), base).toString()
}

export const resolveImageUrl = (value?: string, siteUrl = '') => {
  if (!value) return undefined

  const normalized = value.trim()

  if (!normalized) return undefined
  if (/^https?:\/\//i.test(normalized)) return normalized

  if (normalized.startsWith('/')) {
    return resolveAbsoluteUrl(normalized, siteUrl) || normalized
  }

  if (/\.(png|jpe?g|webp|svg|ico)$/i.test(normalized)) {
    const assetPath = `/${normalized.replace(/^\/+/, '')}`
    return resolveAbsoluteUrl(assetPath, siteUrl) || assetPath
  }

  return undefined
}
