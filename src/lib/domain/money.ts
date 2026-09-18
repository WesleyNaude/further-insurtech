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
  const grouped = whole.toLocaleString('en-ZA')
  const body = opts.decimals ? `${grouped}.${String(part).padStart(2, '0')}` : grouped
  return `${negative ? '-' : ''}R${body}`
}

export const sum = (xs: Cents[]): Cents => xs.reduce((a, b) => a + b, 0)
