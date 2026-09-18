/**
 * Money is always integer cents. Never floats.
 * Carried over from the original build, which got this right.
 */
export type Cents = number

export const rand = (r: number): Cents => Math.round(r * 100)

export function formatRand(c: Cents, opts: { decimals?: boolean } = {}): string {
  const negative = c < 0
  const abs = Math.abs(c)
  const whole = Math.floor(abs / 100)
  const part = abs % 100
  // en-ZA groups with a non-breaking space. Normalise it so rendering and
  // assertions agree, and so the figure never wraps mid-number.
  const grouped = whole.toLocaleString('en-ZA').replace(/\u00A0|\u202F/g, '\u2009')
  const body = opts.decimals ? `${grouped}.${String(part).padStart(2, '0')}` : grouped
  return `${negative ? '-' : ''}R${body}`
}

export const sum = (xs: Cents[]): Cents => xs.reduce((a, b) => a + b, 0)
