export type Grosz = number

/**
 * Polish convention: a comma for the decimal, a space for thousands, zł after.
 *
 * Money is integer grosz throughout and only becomes a string here. Unicode
 * escapes are written out rather than typed literally, because a stray
 * non-breaking space is invisible in a diff and impossible to debug.
 */
export function formatZl(gr: Grosz, opts: { decimals?: boolean } = {}): string {
  const decimals = opts.decimals ?? true
  const negative = gr < 0
  const abs = Math.abs(gr)
  const whole = Math.floor(abs / 100)
  const part = abs % 100

  // pl-PL leaves four-digit numbers ungrouped by default. Money always groups,
  // so a balance never reads as 1234 when it means one thousand.
  const grouped = whole
    .toLocaleString('pl-PL', { useGrouping: 'always' })
    .replace(/[    ]/g, ' ')

  const body = decimals ? `${grouped},${String(part).padStart(2, '0')}` : grouped
  return `${negative ? '-' : ''}${body} zł`
}

/** The fund is denominated in euro, so show it that way where it belongs. */
export function formatEur(gr: Grosz, zlPerEur: number): string {
  return `€${(gr / 100 / zlPerEur).toFixed(2)}`
}

export const sum = (xs: Grosz[]): Grosz => xs.reduce((a, b) => a + b, 0)
