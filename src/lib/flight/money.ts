export type Cents = number

export function formatRand(c: Cents, opts: { decimals?: boolean } = {}): string {
  const negative = c < 0
  const abs = Math.abs(c)
  const whole = Math.floor(abs / 100)
  const part = abs % 100
  // en-ZA groups with a non-breaking space; normalise so the figure never wraps.
  const grouped = whole.toLocaleString('en-ZA').replace(/ | /g, ' ')
  const body = opts.decimals ? `${grouped}.${String(part).padStart(2, '0')}` : grouped
  return `${negative ? '-' : ''}R${body}`
}

/** Kilograms, or tonnes once the number gets big enough to deserve them. */
export function formatMass(kg: number): { value: string; unit: string } {
  if (kg >= 1000) return { value: (kg / 1000).toFixed(2), unit: 't CO2e' }
  return { value: Math.round(kg).toLocaleString('en-ZA'), unit: 'kg CO2e' }
}
