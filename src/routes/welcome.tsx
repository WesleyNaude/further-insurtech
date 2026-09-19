import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ArrowRight, Plane, Wrench, Users } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { useFlightStore } from '@/lib/flight/store'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/welcome')({ component: Welcome })

const STEPS = [
  {
    icon: Plane,
    title: 'A flight warms more than its fuel',
    body: 'Planes leave contrails, and contrails trap heat. Counted properly, a flight does roughly twice the warming the fuel alone suggests.',
  },
  {
    icon: Wrench,
    title: 'Change one thing at home',
    body: 'Water heating is the biggest single item on most South African electricity bills, on a grid that is about 80% coal. Fit a heat pump, a solar geyser or gas, once.',
  },
  {
    icon: Users,
    title: 'Cover your seat and one more',
    body: 'Break even and you have contributed nothing. Prevent enough for two seats and the air is cleaner than if you had stayed home. That is when the ticket is yours.',
  },
]

function Welcome() {
  const navigate = useNavigate()
  const setOnboarded = useFlightStore((s) => s.setOnboarded)
  const [step, setStep] = React.useState(0)
  const reduced = useReducedMotion()

  const last = step === STEPS.length - 1
  const { icon: Icon, title, body } = STEPS[step]

  function next() {
    if (last) {
      setOnboarded(true)
      navigate({ to: '/' })
    } else setStep((s) => s + 1)
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <div className="relative h-[clamp(180px,28dvh,260px)] shrink-0 overflow-hidden bg-sunken">
        <Contrail reduced={Boolean(reduced)} />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper to-transparent" />
      </div>

      <div className="gutter flex flex-1 flex-col pb-6 pt-2">
        <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-ink-faint">
          Further
        </p>

        <div className="mt-7 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-accent-ink">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <h1 className="mt-5 text-[30px] font-semibold leading-[1.12] tracking-[-0.025em] text-ink">
                {title}
              </h1>
              <p className="mt-3 max-w-[32ch] text-[16px] leading-[1.5] text-ink-muted">{body}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="safe-bottom mt-8 shrink-0">
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
              className="tap mt-3 w-full py-2 text-center text-[14px] text-ink-faint"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

/** A plane and the trail it leaves, which is the whole premise in one drawing. */
function Contrail({ reduced }: { reduced: boolean }) {
  return (
    <svg viewBox="0 0 400 220" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <motion.path
        d="M20 170 C 120 168, 210 130, 300 70"
        fill="none"
        stroke="url(#trail)"
        strokeWidth="14"
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: reduced ? 0 : 1.8, ease: [0.32, 0.72, 0, 1] }}
      />
      <motion.path
        d="M20 170 C 120 168, 210 130, 300 70"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduced ? 0 : 1.8, ease: [0.32, 0.72, 0, 1] }}
      />
      <motion.circle
        cx="300"
        cy="70"
        r="5"
        fill="var(--color-accent)"
        initial={reduced ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: reduced ? 0 : 1.6, type: 'spring', stiffness: 380, damping: 20 }}
        style={{ transformOrigin: '300px 70px' }}
      />
    </svg>
  )
}
