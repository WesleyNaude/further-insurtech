import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import confetti from 'canvas-confetti'
import { ArrowRight, Check, Users, IdCard, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { useHandbackStore } from '@/lib/handback/store'
import { formatZl } from '@/lib/handback/money'
import { HANDBACK_GR } from '@/lib/handback/data'
import { confirm as buzz, tap } from '@/lib/haptics'
import { cx } from '@/lib/cx'

export const Route = createFileRoute('/welcome')({ component: Welcome })

type Stage = 'intro' | 'household' | 'identity' | 'checking' | 'approved'

function Welcome() {
  const navigate = useNavigate()
  const setOnboarded = useHandbackStore((s) => s.setOnboarded)
  const approve = useHandbackStore((s) => s.approve)
  const [stage, setStage] = React.useState<Stage>('intro')
  const [people, setPeople] = React.useState(4)
  const reduced = useReducedMotion()

  React.useEffect(() => {
    if (stage !== 'checking') return
    const id = window.setTimeout(() => {
      approve()
      setStage('approved')
      buzz()
      if (!reduced) {
        confetti({
          particleCount: 60,
          spread: 58,
          startVelocity: 26,
          ticks: 150,
          scalar: 0.8,
          origin: { y: 0.35 },
          colors: ['#0E6B4A', '#3FB98A', '#9A9CA3'],
          disableForReducedMotion: true,
        })
      }
    }, 2200)
    return () => window.clearTimeout(id)
  }, [stage, approve, reduced])

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduced ? 0 : 0.26, ease: [0.32, 0.72, 0, 1] }}
          className="flex flex-1 flex-col"
        >
          {stage === 'intro' && (
            <Pane
              // The city's name at the door, not ours. People trust the city.
              eyebrow="Miasto Kraków"
              title="Money back on public transport"
              body="Since the fuel charge came in, households like yours can claim some of it back on every tram, bus and train journey. It is checked once, and then it happens on its own."
              cta="Check if we qualify"
              onNext={() => {
                setStage('household')
                tap()
              }}
            />
          )}

          {stage === 'household' && (
            <Pane
              icon={Users}
              eyebrow="One of two questions"
              title="How many people live with you?"
              body="Including you, and anyone you support. This is how the city works out whether your household qualifies."
              cta="Next"
              onNext={() => {
                setStage('identity')
                tap()
              }}
            >
              <div className="mt-6 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setPeople(n)
                      tap()
                    }}
                    aria-pressed={people === n}
                    className={cx(
                      'h-14 flex-1 rounded-(--radius-card) text-[16px] font-medium ring-1 transition-colors',
                      people === n
                        ? 'bg-ink text-paper ring-ink'
                        : 'bg-surface text-ink ring-line',
                    )}
                  >
                    {n === 5 ? '5+' : n}
                  </button>
                ))}
              </div>
            </Pane>
          )}

          {stage === 'identity' && (
            <Pane
              icon={IdCard}
              eyebrow="Two of two"
              title="Confirm it is you"
              body="Through your mObywatel identity, the same one you use for everything else. We see that you are you and that your household qualifies. Nothing else."
              cta="Confirm and finish"
              onNext={() => {
                setStage('checking')
                tap()
              }}
            />
          )}

          {stage === 'checking' && (
            <div className="gutter flex flex-1 flex-col items-center justify-center text-center">
              <motion.span
                animate={reduced ? {} : { rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                className="text-ink-muted"
              >
                <Loader2 size={30} strokeWidth={1.9} />
              </motion.span>
              <p className="mt-5 text-[16px] font-medium text-ink">Checking with the city</p>
              <p className="mt-1.5 max-w-[28ch] text-[14px] leading-[1.5] text-ink-muted">
                This takes a few seconds. You will not need to do this again.
              </p>
            </div>
          )}

          {stage === 'approved' && (
            <div className="gutter flex flex-1 flex-col">
              <div className="flex flex-1 flex-col justify-center">
                <motion.span
                  initial={reduced ? false : { scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                  className="grid h-20 w-20 place-items-center rounded-full bg-accent text-on-accent"
                >
                  <Check size={38} strokeWidth={2.6} />
                </motion.span>

                <h1 className="mt-7 text-[36px] font-bold leading-[1.06] tracking-[-0.03em] text-ink">
                  You qualify.
                </h1>
                <p className="mt-3 max-w-[30ch] text-[16px] leading-[1.5] text-ink-muted">
                  From now on you get{' '}
                  <span className="font-medium text-ink">{formatZl(HANDBACK_GR)} back</span> on
                  every journey. You do not have to do anything to claim it.
                </p>

                <div className="mt-7 rounded-(--radius-card) bg-sunken p-4">
                  <p className="text-[14px] leading-[1.6] text-ink-muted">
                    Just tap your card the way you always have. The money appears here a few
                    minutes later. There is nothing to open, nothing to scan, and nothing to
                    remember.
                  </p>
                </div>
              </div>

              <div className="safe-bottom shrink-0 pb-8">
                <Button
                  variant="accent"
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    setOnboarded(true)
                    navigate({ to: '/' })
                  }}
                >
                  Done
                  <ArrowRight size={17} strokeWidth={2.1} />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

function Pane({
  icon: Icon,
  eyebrow,
  title,
  body,
  cta,
  onNext,
  children,
}: {
  icon?: typeof Users
  eyebrow: string
  title: string
  body: string
  cta: string
  onNext: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="gutter flex flex-1 flex-col pt-10">
      <div className="flex-1">
        {Icon ? (
          <span className="grid h-11 w-11 place-items-center rounded-full bg-money-soft text-money-ink">
            <Icon size={20} strokeWidth={1.85} />
          </span>
        ) : null}
        <p
          className={cx(
            'text-[14px] font-medium uppercase tracking-[0.12em] text-ink-faint',
            Icon && 'mt-5',
          )}
        >
          {eyebrow}
        </p>
        <h1 className="mt-3 text-[32px] font-bold leading-[1.1] tracking-[-0.027em] text-ink">
          {title}
        </h1>
        <p className="mt-3 max-w-[32ch] text-[16px] leading-[1.5] text-ink-muted">{body}</p>
        {children}
      </div>

      <div className="safe-bottom shrink-0 pb-8">
        <Button variant="primary" size="lg" className="w-full" onClick={onNext}>
          {cta}
          <ArrowRight size={17} strokeWidth={2.1} />
        </Button>
      </div>
    </div>
  )
}
