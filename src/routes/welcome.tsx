import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowRight, ShieldCheck, TrendingDown, Route as RouteIcon } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { RouteFigure } from '@/components/app/RouteFigure'
import { corridorById } from '@/lib/domain/corridors'
import { useStore } from '@/lib/store'
import { formatRand } from '@/lib/domain/money'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/welcome')({ component: Welcome })

const STEPS = [
  {
    icon: TrendingDown,
    title: 'Your premium assumed a number',
    body: 'Every motor policy is priced on an assumed annual mileage. Yours assumed 22,000 kilometres. Most people never find out what theirs was.',
  },
  {
    icon: RouteIcon,
    title: 'Drive under it and you cost less',
    body: 'Kilometres you do not drive are claims your insurer does not expect to pay for. We measure the gap and hand most of it back to you.',
  },
  {
    icon: ShieldCheck,
    title: 'Without being watched',
    body: 'Your routes stay on this phone. Your insurer receives six numbers a month and never sees where you went. You can read the exact payload at any time.',
  },
]

function Welcome() {
  const navigate = useNavigate()
  const setOnboarded = useStore((s) => s.setOnboarded)
  const policy = useStore((s) => s.policy)
  const [step, setStep] = React.useState(0)

  const corridor = corridorById('khay-cbd')!
  const last = step === STEPS.length - 1
  const { icon: Icon, title, body } = STEPS[step]

  function next() {
    if (last) {
      setOnboarded(true)
      navigate({ to: '/' })
    } else setStep((s) => s + 1)
  }

  return (
    <main className="mx-auto flex h-full w-full max-w-md flex-col">
      <div className="relative h-[38dvh] shrink-0 bg-sunken">
        <RouteFigure
          path={corridor.path}
          corridor={corridor.path}
          className="h-full w-full"
          animate
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper to-transparent" />
      </div>

      <div className="gutter flex flex-1 flex-col pt-2">
        <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-ink-faint">
          Further
        </p>

        <div className="mt-8 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-accent-ink">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <h1 className="mt-5 text-[30px] font-semibold leading-[1.12] tracking-[-0.025em] text-ink">
                {title}
              </h1>
              <p className="mt-3 max-w-[30ch] text-[16px] leading-[1.5] text-ink-muted">{body}</p>

              {step === 1 && (
                <p className="mt-5 text-[14px] text-ink-muted">
                  On your {formatRand(policy.basePremiumCents)} premium, the ceiling is{' '}
                  <span className="font-medium text-accent">
                    {formatRand(Math.round(policy.basePremiumCents * 0.3))} a month
                  </span>
                  .
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="safe-bottom pb-8">
          <div className="mb-5 flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={cx(
                  'h-1 flex-1 rounded-full transition-colors duration-300',
                  i <= step ? 'bg-ink' : 'bg-line',
                )}
              />
            ))}
          </div>

          <Button variant="primary" size="lg" className="w-full" onClick={next}>
            {last ? 'Start' : 'Next'}
            <ArrowRight size={17} strokeWidth={2.1} />
          </Button>

          {!last && (
            <button
              onClick={() => {
                setOnboarded(true)
                navigate({ to: '/' })
              }}
              className="mt-3 w-full py-2 text-center text-[14px] text-ink-faint"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
