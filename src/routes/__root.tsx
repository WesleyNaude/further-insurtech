import * as React from 'react'
import { Outlet, createRootRoute, useRouterState, useNavigate } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'
import { BottomNav, Fab } from '@/components/app/AppShell'
import { DeviceFrame } from '@/components/app/DeviceFrame'
import { LogTripSheet } from '@/components/app/LogTripSheet'
import { StartTripSheet } from '@/components/app/StartTripSheet'
import { useStore } from '@/lib/store'

export const Route = createRootRoute({ component: Shell })

/** Routes that own the whole frame and carry their own way back. */
const CHROMELESS = ['/welcome', '/insurer', '/plan', '/track', '/record']

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
          >
            <Outlet />
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
