import { normalizeThemePreference, resolveTheme, THEME_MEDIA_QUERY, THEME_STORAGE_KEY, type ResolvedTheme, type ThemePreference } from '~/utils/theme'

export const useResolvedTheme = () => useState<ResolvedTheme>('theme-resolved', () => 'light')

export const useTheme = () => {
  const preference = useState<ThemePreference>('theme-preference', () => 'system')
  const resolvedTheme = useResolvedTheme()
  let media: MediaQueryList | undefined

  const syncTheme = () => {
    if (!media) return
    const theme = resolveTheme(preference.value, media.matches)
    resolvedTheme.value = theme
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }

  onMounted(() => {
    media = window.matchMedia(THEME_MEDIA_QUERY)
    let stored: string | null = null
    try { stored = localStorage.getItem(THEME_STORAGE_KEY) } catch { /* Storage can be disabled. */ }
    preference.value = normalizeThemePreference(stored)
    syncTheme()
    media.addEventListener('change', syncTheme)
  })

  onBeforeUnmount(() => media?.removeEventListener('change', syncTheme))

  const setPreference = (value: ThemePreference) => {
    preference.value = value
    try { localStorage.setItem(THEME_STORAGE_KEY, value) } catch { /* Theme switching still works without storage. */ }
    syncTheme()
  }

  return { preference, setPreference }
}
