import * as React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Route as RouteIcon, Wallet, BarChart3, Settings, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cx } from '@/lib/cx'

const TABS = [
  { to: '/', label: 'Today', icon: Home },
  { to: '/trips', label: 'Trips', icon: RouteIcon },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
  { to: '/impact', label: 'Impact', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const

/**
 * Translucent bars, X-style: the content scrolls under a blurred, saturated
 * layer with a single hairline. Accent is reserved for the FAB and for unread
 * state, never for chrome.
 */
export function TopBar({
  title,
  subtitle,
  leading,
  trailing,
  large = false,
}: {
  title: string
  subtitle?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  large?: boolean
}) {
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cx(
        'safe-top sticky top-0 z-40 transition-shadow duration-200',
        'bg-paper/72 backdrop-blur-xl backdrop-saturate-150',
        scrolled && 'hairline',
      )}
      style={{ WebkitBackdropFilter: 'blur(24px) saturate(150%)' }}
    >
      <div className="gutter flex h-14 items-center gap-3">
        {leading}
        <div className="min-w-0 flex-1">
          <h1
            className={cx(
              'truncate font-semibold tracking-[-0.01em] text-ink',
              large ? 'text-[17px]' : 'text-[17px]',
            )}
          >
            {title}
          </h1>
          {subtitle && <p className="truncate text-[12px] text-ink-faint">{subtitle}</p>}
        </div>
        {trailing}
      </div>
    </header>
  )
}

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 bg-paper/78 backdrop-blur-xl backdrop-saturate-150 hairline-t"
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
                className="group relative flex h-full flex-col items-center justify-center gap-1"
              >
                <span
                  className={cx(
                    'transition-colors duration-150',
                    active ? 'text-ink' : 'text-ink-faint',
                  )}
                >
                  <Icon size={22} strokeWidth={active ? 2.1 : 1.7} />
                </span>
                <span
                  className={cx(
                    'text-[10px] leading-none transition-colors duration-150',
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

/** The one accent-coloured element on screen. */
export function Fab({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      aria-label="Log a trip"
      className="safe-bottom fixed bottom-[72px] right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-accent text-white shadow-[--shadow-fab]"
    >
      <Plus size={24} strokeWidth={2.2} />
    </motion.button>
  )
}

/** Standard page scaffold: blurred bar, gutter content, room for the nav. */
export function Screen({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto min-h-dvh max-w-md pb-[96px]">{children}</main>
}

export { AnimatePresence }
