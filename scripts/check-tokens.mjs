/**
 * Catches Tailwind v3's `-[--token]` syntax, which v4 does not support.
 *
 * Written the old way, Tailwind emits an invalid declaration, the browser
 * silently discards it, and the style is simply absent. Every corner radius
 * and shadow in this app was nothing for days before anyone noticed, because
 * nothing errors: it just looks slightly wrong.
 *
 * In v4 a bare custom property is `-(--token)`, shorthand for `-[var(--token)]`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const OFFENDER = /\b[a-z-]+-\[--[a-z0-9-]+\]/g
const found = []

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(tsx?|css)$/.test(name)) {
      readFileSync(p, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          for (const m of line.matchAll(OFFENDER)) {
            found.push(`${p}:${i + 1}  ${m[0]}  ->  ${m[0].replace('-[', '-(').replace(']', ')')}`)
          }
        })
    }
  }
}

walk('src')

if (found.length) {
  console.error(`\n${found.length} Tailwind v3 token reference(s) that emit nothing in v4:\n`)
  for (const f of found) console.error('  ' + f)
  console.error('')
  process.exit(1)
}
console.log('token syntax ok')
