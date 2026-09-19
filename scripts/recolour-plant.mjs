// Re-tints the plant Lottie from the old Further lime palette into the Uber
// green ramp, and turns the near-white late-stage blossoms gold so they are
// visible on a white card as well as a black one.
//
// Run: node scripts/recolour-plant.mjs <source.json> <dest.json>
// Kept as a script rather than done by hand so the mapping is auditable and
// can be re-run if the source animation is ever replaced.
import { readFileSync, writeFileSync } from 'node:fs'

// Source greens, darkest to lightest, mapped onto a ramp built from Base's
// green400 (#06C167). Relative lightness is preserved so the leaves keep
// their shading instead of flattening to one fill.
const MAP = {
  '#69980E': '#0E6B3D',
  '#78B108': '#0E8345',
  '#9DC105': '#12A15A',
  '#9CC914': '#06C167',
  '#B9D835': '#4FD98F',
  // Blossoms. #EBEBEB disappears against a white card; gold reads on both
  // themes and carries the right meaning on a savings screen.
  '#EBEBEB': '#E0A93F',
  // Soil and pot are left alone: they sit fine on either background.
}

const hex = (k) => '#' + k.slice(0, 3).map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('').toUpperCase()
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)

let hits = 0
function walk(node) {
  if (Array.isArray(node)) return node.forEach(walk)
  if (!node || typeof node !== 'object') return
  if ((node.ty === 'fl' || node.ty === 'st') && node.c && Array.isArray(node.c.k)) {
    const k = node.c.k
    if (k.length >= 3 && k.slice(0, 3).every((x) => typeof x === 'number')) {
      const to = MAP[hex(k)]
      if (to) {
        node.c.k = [...rgb(to), ...k.slice(3)]
        hits++
      }
    }
  }
  Object.values(node).forEach(walk)
}

const [, , src, dest] = process.argv
const doc = JSON.parse(readFileSync(src, 'utf8'))
walk(doc)
writeFileSync(dest, JSON.stringify(doc))
console.log(`recoloured ${hits} fills -> ${dest}`)
