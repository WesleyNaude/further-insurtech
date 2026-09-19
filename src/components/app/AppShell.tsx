import * as React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Wallet, Receipt, PiggyBank, Settings } from 'lucide-react'
import { motion } from 'motion/react'
import { cx } from '@/lib/cx'
import { tap } from '@/lib/haptics'

const TABS = [
  { to: '/', label: 'Wallet', icon: Wallet },
  { to: '/journeys', label: 'Journeys', icon: Receipt },
  { to: '/goal', label: 'Saving', icon: PiggyBank },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

/**
 * Translucent bars, X-style: content scrolls under a blurred, saturated layer
 * with a single hairline. Accent is reserved for the one primary action.
 *
 * Nothing here is position:fixed. Fixed elements anchor to the viewport, which
 * breaks the moment the app is presented inside a frame on desktop. The shell
 * owns its own scroll container and the bars sit outside it.
 */

/**
 * Tracks whether a page's headline figure has scrolled away.
 *
 * A page marks the end of its hero with <HeroEnd />; the bar then swaps its
 * title for a condensed version of that figure, so the number the screen is
 * about is never off screen. Pages without a hero simply never set it.
 */
const HeroScope = React.createContext<{
  past: boolean
  set: (v: boolean) => void
}>({ past: false, set: () => {} })

export function HeroScopeProvider({ children }: { children: React.ReactNode }) {
  const [past, setPast] = React.useState(false)
  const value = React.useMemo(() => ({ past, set: setPast }), [past])
  return <HeroScope.Provider value={value}>{children}</HeroScope.Provider>
}

/** Placed directly after a page's hero. */
export function HeroEnd() {
  const { set } = React.useContext(HeroScope)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => set(!e.isIntersecting), { threshold: 0 })
    io.observe(el)
    return () => {
      io.disconnect()
      set(false)
    }
  }, [set])

  return <div ref={ref} className="h-px w-full" aria-hidden />
}

/** Detects whether the content beneath the bar has scrolled, without needing a
 *  reference to whichever element is doing the scrolling. */
function useScrolledPast() {
  const sentinel = React.useRef<HTMLDivElement>(null)
  const [past, setPast] = React.useState(false)

  React.useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setPast(!e.isIntersecting), { threshold: 1 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return { sentinel, past }
}

export function TopBar({
  title,
  subtitle,
  leading,
  trailing,
  condensed,
}: {
  title: string
  subtitle?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  /** Swaps in once the page's headline figure has scrolled away, so the number
   *  the screen is about is never off screen. */
  condensed?: React.ReactNode
}) {
  const { sentinel, past } = useScrolledPast()
  const hero = React.useContext(HeroScope)
  const showCondensed = Boolean(condensed) && hero.past

  return (
    <>
      <div ref={sentinel} className="h-px w-full" aria-hidden />
      <header
        className={cx(
          'safe-top sticky top-0 z-40 -mt-px transition-shadow duration-200',
          'bg-paper/72 backdrop-blur-xl backdrop-saturate-150',
          past && 'hairline',
        )}
        style={{ WebkitBackdropFilter: 'blur(24px) saturate(150%)' }}
      >
        <div className="gutter flex h-14 items-center gap-3">
          {leading}
          <div className="relative min-w-0 flex-1">
            <motion.div
              animate={{ opacity: showCondensed ? 0 : 1, y: showCondensed ? -6 : 0 }}
              transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
            >
              <h1 className="truncate text-[16px] font-medium tracking-[-0.012em] text-ink">
                {title}
              </h1>
              {subtitle && <p className="truncate text-[12px] text-ink-faint">{subtitle}</p>}
            </motion.div>

            {condensed && (
              <motion.div
                aria-hidden={!showCondensed}
                initial={false}
                animate={{ opacity: showCondensed ? 1 : 0, y: showCondensed ? 0 : 6 }}
                transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                className="pointer-events-none absolute inset-0 flex items-center"
              >
                {condensed}
              </motion.div>
            )}
          </div>
          {trailing}
        </div>
      </header>
    </>
  )
}

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav
      className="safe-bottom relative z-40 shrink-0 bg-paper/78 backdrop-blur-xl backdrop-saturate-150 hairline-t"
      style={{ WebkitBackdropFilter: 'blur(24px) saturate(150%)' }}
    >
      <ul className="mx-auto flex h-[56px] max-w-md items-stretch">
        {TABS.map(({ to, label, icon: Icon }) => {
          const active = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                onClick={() => !active && tap()}
                className="group relative flex h-full flex-col items-center justify-center gap-1"
              >
                <span className={cx('transition-colors duration-150', active ? 'text-ink' : 'text-ink-faint')}>
                  <Icon size={22} strokeWidth={active ? 2.1 : 1.7} />
                </span>
                <span
                  className={cx(
                    'text-[12px] leading-none transition-colors duration-150',
                    active ? 'font-medium text-ink' : 'text-ink-faint',
                  )}
                >
                  {label}
                </span>
                {active && (
                  <motion.span
                    layoutId="tab-dot"
                    transition={{ type: 'spring', stiffness: 520, damping: 38 }}
                    className="absolute top-1 h-[3px] w-[3px] rounded-full bg-ink"
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** The app works offline by design, so the only honest message is that figures
 *  are current as of the last sync, not that something is broken. */
export function OfflineBar() {
  const [offline, setOffline] = React.useState(() => !navigator.onLine)

  React.useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="shrink-0 bg-ink px-5 py-2 text-center text-[12px] font-medium text-paper">
      Offline. Trips are still recorded on this device.
    </div>
  )
}

/** Page scaffold used by every screen inside the shell's scroll container. */
export function Screen({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto w-full max-w-md pb-10">{children}</main>
}
