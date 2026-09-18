import * as React from 'react'
import { Share2, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { Statement } from '@/lib/domain/engine'
import { formatRand } from '@/lib/domain/money'
import { Button } from '@/components/ui/primitives'

/**
 * A month's statement, drawn to a canvas and handed to the platform share sheet.
 *
 * Deliberately says what was saved and how, and carries the disclaimer with it.
 * A shared image is the one artefact that travels without its context, so the
 * context has to be printed on it.
 */
export function ShareCard({
  statement,
  insurer,
}: {
  statement: Statement
  insurer: string
}) {
  const [busy, setBusy] = React.useState(false)
  const [done, setDone] = React.useState(false)

  async function share() {
    setBusy(true)
    try {
      const blob = await draw(statement, insurer)
      const file = new File([blob], 'further-statement.png', { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Further statement',
          text: `${formatRand(statement.reductionCents)} off my car insurance this month, for driving less.`,
        })
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'further-statement.png'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Statement saved as an image')
      }
      setDone(true)
      setTimeout(() => setDone(false), 2400)
    } catch {
      // A cancelled share sheet is not an error worth shouting about.
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button onClick={share} disabled={busy} className="w-full">
      {done ? <Check size={16} strokeWidth={2.2} /> : <Share2 size={16} strokeWidth={1.9} />}
      {done ? 'Shared' : 'Share this month'}
    </Button>
  )
}

async function draw(s: Statement, insurer: string): Promise<Blob> {
  const W = 1080
  const H = 1350
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const x = c.getContext('2d')!

  const ink = '#16181C'
  const paper = '#FAFAF8'
  const muted = '#63666E'
  const faint = '#9A9CA3'
  const accent = '#0E6B4A'

  x.fillStyle = paper
  x.fillRect(0, 0, W, H)

  const M = 96
  x.textBaseline = 'alphabetic'

  // Wordmark
  x.fillStyle = faint
  x.font = '500 30px Inter, system-ui, sans-serif'
  x.letterSpacing = '4px'
  x.fillText('FURTHER', M, M + 30)
  x.letterSpacing = '0px'

  // Headline figure
  const month = new Date().toLocaleDateString('en-ZA', { month: 'long' })
  x.fillStyle = muted
  x.font = '500 34px Inter, system-ui, sans-serif'
  x.fillText(`Off my ${month} car insurance`, M, 330)

  x.fillStyle = ink
  x.font = '600 210px Inter, system-ui, sans-serif'
  const amount = formatRand(s.reductionCents)
  x.fillText(amount, M, 520)

  x.fillStyle = muted
  x.font = '400 36px Inter, system-ui, sans-serif'
  x.fillText('for driving less than my policy assumed', M, 590)

  // Rule
  x.strokeStyle = '#E5E5E1'
  x.lineWidth = 2
  x.beginPath()
  x.moveTo(M, 690)
  x.lineTo(W - M, 690)
  x.stroke()

  // Three figures
  const stats: [string, string][] = [
    [`${Math.round(s.avoidedKm).toLocaleString('en-ZA')} km`, 'under my rating'],
    [`${Math.round(s.displacedKm).toLocaleString('en-ZA')} km`, 'not driven'],
    [`${Math.round(s.premiumReduction * 100)}%`, 'off the premium'],
  ]
  stats.forEach(([v, k], i) => {
    const cx = M + i * ((W - M * 2) / 3)
    x.fillStyle = i === 2 ? accent : ink
    x.font = '600 62px Inter, system-ui, sans-serif'
    x.fillText(v, cx, 800)
    x.fillStyle = faint
    x.font = '400 28px Inter, system-ui, sans-serif'
    x.fillText(k, cx, 846)
  })

  // Bar to the ceiling
  const barY = 960
  const barW = W - M * 2
  x.fillStyle = '#EDEDEA'
  roundRect(x, M, barY, barW, 18, 9)
  x.fill()
  x.fillStyle = accent
  roundRect(x, M, barY, barW * Math.min(1, s.premiumReduction / 0.3), 18, 9)
  x.fill()

  x.fillStyle = faint
  x.font = '400 26px Inter, system-ui, sans-serif'
  x.fillText('30% is the monthly ceiling', M, barY + 66)

  // Footer: the context that has to travel with the image
  x.fillStyle = muted
  x.font = '400 27px Inter, system-ui, sans-serif'
  wrap(
    x,
    `Verified on my own phone. ${insurer} receives six numbers a month and never sees where I went.`,
    M,
    1140,
    barW,
    38,
  )
  x.fillStyle = faint
  x.font = '400 23px Inter, system-ui, sans-serif'
  wrap(
    x,
    'Modelled figures, not a quotation. This does not offset emissions and is not a carbon credit.',
    M,
    1248,
    barW,
    32,
  )

  return new Promise((res) => c.toBlob((b) => res(b!), 'image/png'))
}

function roundRect(x: CanvasRenderingContext2D, l: number, t: number, w: number, h: number, r: number) {
  x.beginPath()
  x.roundRect(l, t, Math.max(w, r * 2), h, r)
}

function wrap(
  x: CanvasRenderingContext2D,
  text: string,
  left: number,
  top: number,
  maxW: number,
  lh: number,
) {
  let line = ''
  let y = top
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word
    if (x.measureText(test).width > maxW && line) {
      x.fillText(line, left, y)
      line = word
      y += lh
    } else line = test
  }
  if (line) x.fillText(line, left, y)
}
