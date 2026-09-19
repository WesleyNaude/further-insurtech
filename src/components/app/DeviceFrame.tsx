import * as React from 'react'
import { Share, Plus } from 'lucide-react'
import { cx } from '@/lib/cx'

/**
 * Further is a mobile web app, so the phone is the only design target.
 *
 * On a desktop browser the app is presented in a device-sized frame rather
 * than stretched: a 400px column stretched to 1440px is not a wider app, it is
 * a broken one. The only desktop-specific content is a short note on how to
 * install it, because installed is how it is meant to be used.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const [standalone, setStandalone] = React.useState(false)

  React.useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)')
    const sync = () =>
      setStandalone(
        mql.matches || (window.navigator as { standalone?: boolean }).standalone === true,
      )
    sync()
    mql.addEventListener('change', sync)
    return () => mql.removeEventListener('change', sync)
  }, [])

  return (
    <div
      className={cx(
        'min-h-dvh',
        // Framed presentation only where there is room for it.
        'lg:grid lg:min-h-dvh lg:place-items-center lg:bg-sunken lg:p-8',
      )}
    >
      <div
        className={cx(
          'relative flex h-dvh w-full flex-col overflow-hidden bg-paper',
          'lg:h-[min(880px,calc(100dvh-64px))] lg:w-[400px] lg:rounded-[44px]',
          'lg:shadow-[0_32px_80px_-16px_rgba(22,24,28,0.3)] lg:ring-1 lg:ring-line-strong',
        )}
      >
        {children}
      </div>

      {!standalone && (
        <div className="hidden lg:block">
          <InstallHint />
        </div>
      )}
    </div>
  )
}

/** Quiet, dismissible, and never in the way of the app itself. */
export function InstallHint({ inline = false }: { inline?: boolean } = {}) {
  const [dismissed, setDismissed] = React.useState(
    () => localStorage.getItem('further.installHint') === 'dismissed',
  )
  const [prompt, setPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)

  React.useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  if (dismissed) return null

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

  function close() {
    localStorage.setItem('further.installHint', 'dismissed')
    setDismissed(true)
  }

  return (
    <div className={cx(inline ? 'gutter' : 'gutter mt-6')}>
      <div className="mx-auto flex max-w-[400px] items-center gap-3 rounded-(--radius-card) bg-ink px-4 py-3 text-paper shadow-(--shadow-card)">
        <span className="min-w-0 flex-1 text-[14px] leading-[1.4]">
          {prompt ? (
            'Install Further for a full-screen app with no browser bars.'
          ) : isIOS ? (
            <>
              Add to Home Screen from <Share size={13} className="inline align-[-2px]" /> for
              full screen.
            </>
          ) : (
            <>
              Install from your browser menu (<Plus size={13} className="inline align-[-2px] " />{' '}
              Add to Home Screen) for full screen.
            </>
          )}
        </span>
        {prompt ? (
          <button
            onClick={async () => {
              await prompt.prompt()
              close()
            }}
            className="tap tap-wide shrink-0 rounded-(--radius-pill) bg-paper px-3 py-1.5 text-[14px] font-medium text-ink"
          >
            Install
          </button>
        ) : (
          <button onClick={close} className="tap tap-wide shrink-0 text-[14px] font-medium text-paper/70">
            Got it
          </button>
        )}
      </div>
    </div>
  )
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}
