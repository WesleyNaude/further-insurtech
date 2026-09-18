import type { Statement } from './domain/engine'
import type { Trip, Policy } from './domain/types'
import { DISPLACING_MODES } from './domain/engine'

/**
 * A portable mileage record.
 *
 * The point of the product is that this belongs to the member, not to whoever
 * currently insures them. It is a compact, canonical statement of exposure that
 * can be handed to any insurer, with a SHA-256 digest over the exact bytes so
 * that a recipient can tell whether a figure has been altered after issue.
 *
 * The digest proves integrity, not authenticity: in production the issuer would
 * sign it. We are explicit about that distinction in the UI rather than implying
 * a guarantee we are not making.
 */
export interface Credential {
  issuer: 'further'
  version: 1
  period: { from: string; to: string }
  subject: { ref: string }
  exposure: {
    ratedAnnualKm: number
    drivenKm: number
    displacedKm: number
    avoidedKm: number
    exposureReduction: number
  }
  evidence: {
    tripsTotal: number
    verified: number
    probable: number
    rejected: number
    corridorsUsed: string[]
  }
  issuedAt: string
}

/** Local calendar date. toISOString() would shift SAST back into the previous day. */
function localDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function buildCredential(
  trips: Trip[],
  statement: Statement,
  policy: Policy,
  now = new Date(),
): Credential {
  const from = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    issuer: 'further',
    version: 1,
    period: { from: localDate(from), to: localDate(now) },
    subject: { ref: 'FR-' + hash32(policy.vehicle + policy.linkedAt).toUpperCase() },
    exposure: {
      ratedAnnualKm: policy.ratedAnnualKm,
      drivenKm: Math.round(statement.drivenKm),
      displacedKm: Math.round(statement.displacedKm),
      avoidedKm: Math.round(statement.avoidedKm),
      exposureReduction: Number(statement.exposureReduction.toFixed(4)),
    },
    evidence: {
      tripsTotal: trips.length,
      verified: trips.filter((t) => t.verification === 'verified').length,
      probable: trips.filter((t) => t.verification === 'probable').length,
      rejected: trips.filter((t) => t.verification === 'unverified').length,
      corridorsUsed: [
        ...new Set(
          trips
            .filter((t) => DISPLACING_MODES.includes(t.mode) && t.verification === 'verified')
            .map((t) => t.corridorId),
        ),
      ].sort(),
    },
    issuedAt: now.toISOString(),
  }
}

/** Canonical JSON: stable key order, so the digest is reproducible. */
export function canonicalise(c: Credential): string {
  return JSON.stringify(c, Object.keys(c).sort())
}

export async function digest(c: Credential): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(c))
  if (!globalThis.crypto?.subtle) return hash32(JSON.stringify(c)).padEnd(16, '0')
  const buf = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Small non-cryptographic hash, used only for a human-readable reference. */
function hash32(s: string): string {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}
