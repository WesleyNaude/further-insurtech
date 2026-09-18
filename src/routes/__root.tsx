import * as React from 'react'
import {
  Outlet,
  createRootRoute,
  useRouterState,
  useNavigate,
  type ErrorComponentProps,
} from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { BottomNav, Fab, OfflineBar, HeroScopeProvider } from '@/components/app/AppShell'
import { DeviceFrame } from '@/components/app/DeviceFrame'
import { LogTripSheet } from '@/components/app/LogTripSheet'
import { StartTripSheet } from '@/components/app/StartTripSheet'
import { useStore } from '@/lib/store'

export const Route = createRootRoute({
  component: Shell,
  notFoundComponent: NotFound,
  errorComponent: AppError,
})

/** Routes that own the whole frame and carry their own way back. */
const CHROMELESS = ['/welcome', '/insurer', '/plan', '/track', '/record', '/cover']

/** A crash should never be a white screen, and should never lose the member's
 *  data. Everything lives in local storage, so recovery is a reload. */
function AppError({ error }: ErrorComponentProps) {
  return (
    <div className="grid flex-1 place-items-center px-6 text-center">
      <div className="max-w-[34ch]">
        <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-ink">
          Something broke
        </h1>
        <p className="mt-2 text-[14px] leading-[1.55] text-ink-muted">
          Your trips are safe: everything is stored on this device. Reloading usually fixes it.
        </p>
        <p className="mt-4 break-words rounded-[12px] bg-sunken p-3 text-left font-mono text-[11px] leading-[1.5] text-ink-faint">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 inline-flex h-11 items-center rounded-[--radius-pill] bg-ink px-5 text-[15px] font-medium text-paper"
        >
          Reload
        </button>
      </div>
    </div>
  )
}

function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="grid flex-1 place-items-center px-5 text-center">
      <div>
        <p className="text-[15px] text-ink-muted">That screen does not exist.</p>
        <button
          onClick={() => navigate({ to: '/' })}
          className="mt-4 inline-flex h-11 items-center rounded-[--radius-pill] bg-sunken px-4 text-[15px] font-medium text-ink"
        >
          Back to today
        </button>
      </div>
    </div>
  )
}

function Shell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const onboarded = useStore((s) => s.onboarded)
  const [adding, setAdding] = React.useState(false)
  const [logging, setLogging] = React.useState(false)
  const scroller = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!onboarded && pathname !== '/welcome') navigate({ to: '/welcome' })
  }, [onboarded, pathname, navigate])

  // Each screen starts at the top, the way a native push does.
  React.useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
  }, [pathname])

  const isTripDetail = pathname.startsWith('/trips/')
  const chromeless = CHROMELESS.includes(pathname) || isTripDetail
  const showFab = pathname === '/' || pathname === '/trips'

  return (
    <DeviceFrame>
      <OfflineBar />
      <div ref={scroller} className="no-scrollbar relative flex-1 overflow-y-auto overscroll-contain">
        {/* A short cross-fade only. Anything more slides the blurred bars and
            reads as lag rather than polish. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14, ease: 'linear' }}
            className="flex min-h-full flex-col"
          >
            <HeroScopeProvider>
              <Outlet />
            </HeroScopeProvider>
          </motion.div>
        </AnimatePresence>
      </div>

      {!chromeless && <BottomNav />}
      {showFab && <Fab onClick={() => setAdding(true)} />}

      <StartTripSheet open={adding} onOpenChange={setAdding} onManual={() => setLogging(true)} />

      <LogTripSheet
        open={logging}
        onOpenChange={setLogging}
        onLogged={(id) => navigate({ to: '/trips/$tripId', params: { tripId: id } })}
      />

      <Toaster
        position="top-center"
        offset={72}
        toastOptions={{
          style: {
            borderRadius: '12px',
            border: '1px solid var(--color-line)',
            background: 'var(--color-surface)',
            color: 'var(--color-ink)',
            fontSize: '14px',
          },
        }}
      />
    </DeviceFrame>
  )
}
