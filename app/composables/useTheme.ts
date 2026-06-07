type ThemePreference = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'amumu-theme'

const resolveSystemTheme = (): ResolvedTheme => {
  if (!import.meta.client) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useTheme = () => {
  const preference = useState<ThemePreference>('theme-preference', () => 'system')
  const resolvedTheme = useState<ResolvedTheme>('theme-resolved', () => 'light')

  let cleanup: (() => void) | null = null

  const applyTheme = (theme: ResolvedTheme) => {
    if (!import.meta.client) return
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }

  const syncTheme = () => {
    const nextTheme = preference.value === 'system' ? resolveSystemTheme() : preference.value
    resolvedTheme.value = nextTheme
    applyTheme(nextTheme)
  }

  const setupSystemListener = () => {
    if (!import.meta.client || cleanup) return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (preference.value === 'system') {
        syncTheme()
      }
    }

    media.addEventListener('change', handler)
    cleanup = () => media.removeEventListener('change', handler)
  }

  onMounted(() => {
    if (!import.meta.client) return

    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      preference.value = stored
    } else {
      preference.value = 'system'
    }

    syncTheme()
    setupSystemListener()
  })

  onBeforeUnmount(() => {
    cleanup?.()
    cleanup = null
  })

  watch(
    preference,
    (value) => {
      if (!import.meta.client) return

      if (value === 'system') {
        localStorage.removeItem(THEME_STORAGE_KEY)
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, value)
      }

      syncTheme()
    }
  )

  const toggleTheme = () => {
    preference.value = resolvedTheme.value === 'dark' ? 'light' : 'dark'
  }

  const themeIcon = computed(() => (resolvedTheme.value === 'dark' ? '☀️' : '🌙'))
  const themeLabel = computed(() => (resolvedTheme.value === 'dark' ? '切换到浅色模式' : '切换到深色模式'))

  return {
    preference,
    resolvedTheme,
    toggleTheme,
    themeIcon,
    themeLabel
  }
}
