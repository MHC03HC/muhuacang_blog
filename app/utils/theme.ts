export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = Exclude<ThemePreference, 'system'>

export const THEME_STORAGE_KEY = 'amumu-theme'
export const THEME_MEDIA_QUERY = '(prefers-color-scheme: dark)'

export function normalizeThemePreference(value: unknown): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function resolveTheme(preference: ThemePreference, systemDark: boolean): ResolvedTheme {
  return preference === 'system' ? (systemDark ? 'dark' : 'light') : preference
}

// Static inputs only. Run before paint and let the mounted composable take over.
export const themeInitScript = `(function(){var stored;try{stored=localStorage.getItem('${THEME_STORAGE_KEY}');}catch(e){}var theme=(stored==='light'||stored==='dark')?stored:(window.matchMedia('${THEME_MEDIA_QUERY}').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;})();`
