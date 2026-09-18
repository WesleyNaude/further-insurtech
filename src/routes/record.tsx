import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronLeft, Download, Copy, Check, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { TopBar } from '@/components/app/AppShell'
import { Button, Card, Divider } from '@/components/ui/primitives'
import { useStatement } from '@/lib/useStatement'
import { buildCredential, digest, type Credential } from '@/lib/credential'
import { corridorById } from '@/lib/domain/corridors'

export const Route = createFileRoute('/record')({ component: RecordScreen })

/**
 * The portable credential.
 *
 * This is the strategic centre of the product. An insurer's own telematics
 * record belongs to the insurer and locks the member in. This one belongs to the
 * member and can be taken to anyone, which is precisely why an incumbent would
 * never build it.
 */
function RecordScreen() {
  const navigate = useNavigate()
  const { statement, policy, monthTrips } = useStatement()
  const [sha, setSha] = React.useState<string>('')
  const [copied, setCopied] = React.useState(false)

  const credential = React.useMemo(
    () => buildCredential(monthTrips, statement, policy),
    [monthTrips, statement, policy],
  )

  React.useEffect(() => {
    digest(credential).then(setSha)
  }, [credential])

  const json = JSON.stringify(credential, null, 2)

  async function copy() {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Record copied')
    } catch {
      toast.error('Could not copy')
    }
  }

  function download() {
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `further-record-${credential.period.to}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Record saved')
  }

  return (
    <main className="mx-auto w-full max-w-md pb-10">
      <TopBar
        title="Your mileage record"
        leading={
          <button
            onClick={() => navigate({ to: '/settings' })}
            aria-label="Back"
            className="-ml-2 grid h-11 w-11 place-items-center rounded-full text-ink"
          >
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
        }
      />

      <div className="gutter pt-2">
        <p className="text-[14px] leading-[1.55] text-ink-muted">
          This record is yours, not your insurer&rsquo;s. Take it to anyone and be quoted on
          evidence instead of on an assumption about you.
        </p>
      </div>

      {/* The certificate */}
      <div className="gutter mt-6">
        <Card inset={false} className="overflow-hidden">
          <div className="bg-ink px-5 py-4 text-paper">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-paper/60">
              Verified exposure record
            </p>
            <p className="tnum mt-1 text-[17px] font-semibold">{credential.subject.ref}</p>
          </div>

          <div className="px-5 py-1">
            <Line label="Period" value={`${credential.period.from} to ${credential.period.to}`} />
            <Divider />
            <Line
              label="Rated annual mileage"
              value={`${credential.exposure.ratedAnnualKm.toLocaleString('en-ZA')} km`}
            />
            <Divider />
            <Line label="Driven" value={`${credential.exposure.drivenKm} km`} />
            <Divider />
            <Line label="Travelled by other modes" value={`${credential.exposure.displacedKm} km`} />
            <Divider />
            <Line
              label="Exposure avoided"
              value={`${Math.round(credential.exposure.exposureReduction * 100)}%`}
              strong
            />
          </div>

          <div className="bg-sunken px-5 py-4">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-faint">
              Evidence
            </p>
            <p className="mt-1.5 text-[13px] leading-[1.5] text-ink-muted">
              {credential.evidence.verified} verified, {credential.evidence.probable} probable,{' '}
              {credential.evidence.rejected} rejected across {credential.evidence.tripsTotal} trips.
            </p>
            {credential.evidence.corridorsUsed.length > 0 && (
              <p className="mt-1.5 text-[13px] leading-[1.5] text-ink-muted">
                Corridors:{' '}
                {credential.evidence.corridorsUsed
                  .map((id) => corridorById(id)?.name ?? id)
                  .join(', ')}
                .
              </p>
            )}
          </div>

          <div className="px-5 py-4">
            <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-ink-faint">
              Digest
            </p>
            <p className="tnum mt-1 break-all font-mono text-[11px] leading-[1.5] text-ink-muted">
              {sha || 'computing…'}
            </p>
            <p className="mt-2 text-[12px] leading-[1.5] text-ink-faint">
              SHA-256 over the record above. It shows whether a figure has been altered since
              issue. It is not a signature, and does not by itself prove who issued it.
            </p>
          </div>
        </Card>
      </div>

      <div className="gutter mt-4 grid grid-cols-2 gap-2">
        <Button onClick={copy}>
          {copied ? <Check size={15} strokeWidth={2.2} /> : <Copy size={15} strokeWidth={1.9} />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button onClick={download}>
          <Download size={15} strokeWidth={1.9} />
          Download
        </Button>
      </div>

      <div className="gutter mt-8">
        <div className="rounded-[--radius-card] bg-sunken p-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-ink-muted">
              <FileText size={15} strokeWidth={1.9} />
            </span>
            <p className="text-[13px] leading-[1.6] text-ink-muted">
              <strong className="font-medium text-ink">Why portable matters.</strong> An
              insurer&rsquo;s own telematics record belongs to the insurer, and leaving takes your
              history with it. This one moves with you, which is the difference between a loyalty
              feature and a market instrument.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <span className="text-[14px] text-ink-muted">{label}</span>
      <span
        className={
          strong
            ? 'tnum text-[15px] font-semibold text-accent'
            : 'tnum text-[14px] font-medium text-ink'
        }
      >
        {value}
      </span>
    </div>
  )
}

export type { Credential }
