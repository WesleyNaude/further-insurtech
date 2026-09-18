/**
 * Local calendar dates.
 *
 * toISOString() converts to UTC first, so in SAST (UTC+2) any moment between
 * midnight and 02:00 reports the previous day. That has already produced two
 * real bugs here: a credential period starting in the wrong month, and a chart
 * whose week buckets never matched its data. Every calendar-day key in the app
 * goes through these.
 */

export function localDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** The Monday of the week containing d, as a local date key. */
export function weekKey(d: Date): string {
  const c = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  c.setDate(c.getDate() - ((c.getDay() + 6) % 7))
  return localDateKey(c)
}
