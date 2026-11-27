export type ContactIcon = 'github' | 'mail'

export type ContactLink = {
  key: string
  label: string
  display: string
  href: string
  icon: ContactIcon
  external?: boolean
}

export const profile = {
  name: '阿木木',
  tagline: '工程控制 · 智能算法 · 科研项目实践',
  introduction: '记录科研探索、算法学习与工程实践，在不断学习和解决问题的过程中积累知识。',
  about: '你好，我是阿木木。我把科研过程、读过的论文和做过的工程实践整理成可以反复查阅的技术档案。',
  interests: ['强化学习', 'MoE', '具身智能', '点云处理', '路径规划与控制', 'Linux / Fedora'],
  technologies: ['Python', 'C++', 'Linux', 'Nuxt', 'Vue', 'TypeScript']
}

export const contactLinks: ContactLink[] = [
  {
    key: 'email',
    label: '邮箱',
    display: 'muhchc@163.com',
    href: 'mailto:muhchc@163.com',
    icon: 'mail'
  },
  {
    key: 'github',
    label: 'GitHub',
    display: 'MHC03HC',
    href: 'https://github.com/MHC03HC',
    icon: 'github',
    external: true
  }
]
