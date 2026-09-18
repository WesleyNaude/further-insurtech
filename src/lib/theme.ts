import * as React from 'react'

export type Theme = 'system' | 'light' | 'dark'

const KEY = 'further.theme'

/**
 * The stylesheet already handles system dark mode. This only exists so a member
 * can override it, which matters on a phone used outdoors in daylight.
 */
export function applyTheme(t: Theme) {
  const root = document.documentElement
  if (t === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', t)

  const dark =
    t === 'dark' ||
    (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((m) => m.setAttribute('content', dark ? '#0F1113' : '#FAFAF8'))
}

export function useTheme() {
  const [theme, setTheme] = React.useState<Theme>(
    () => (localStorage.getItem(KEY) as Theme) || 'dark',
  )

  React.useEffect(() => {
    localStorage.setItem(KEY, theme)
    applyTheme(theme)
  }, [theme])

  return [theme, setTheme] as const
}
