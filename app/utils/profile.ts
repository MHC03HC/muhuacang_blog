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
  tagline: '工程控制 · 智能算法 · 科研项目实践'
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
