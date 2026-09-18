import * as React from 'react'
import { Outlet, createRootRoute, useRouterState, useNavigate } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { BottomNav, Fab } from '@/components/app/AppShell'
import { LogTripSheet } from '@/components/app/LogTripSheet'
import { useStore } from '@/lib/store'

export const Route = createRootRoute({ component: Shell })

/** Routes that own the full screen and hide the chrome. */
const FULL_BLEED = ['/trips/', '/welcome', '/insurer', '/plan']

function Shell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const navigate = useNavigate()
  const [logging, setLogging] = React.useState(false)

  const onboarded = useStore((s) => s.onboarded)

  React.useEffect(() => {
    if (!onboarded && pathname !== '/welcome') navigate({ to: '/welcome' })
  }, [onboarded, pathname, navigate])

  const isDetail =
    pathname === '/welcome' ||
    (FULL_BLEED.some((p) => pathname.startsWith(p)) && pathname !== '/trips')
  const showFab = pathname === '/' || pathname === '/trips'


  return (
    <>
      <Outlet />
      {!isDetail && <BottomNav />}
      {showFab && <Fab onClick={() => setLogging(true)} />}

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
    </>
  )
}
