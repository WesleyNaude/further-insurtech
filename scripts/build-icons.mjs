// Renders the PWA icon set from the brand logo.
//
// The installed app's splash screen is the manifest icon on the manifest's
// background_color, so these and the colours in vite.config.ts have to move
// together.
//
// Run: node scripts/build-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const BRAND = '#16B364'
const lockup = readFileSync('src/assets/logo.svg', 'utf8')

// The lockup cropped to its 48x48 mark.
const mark = lockup
  .replace('viewBox="0 0 148 54"', 'viewBox="3 0 48 48"')
  .replace('width="148" height="54"', 'width="512" height="512"')
writeFileSync('public/icon.svg', mark)

const render = (size) => sharp(Buffer.from(mark), { density: 600 }).resize(size, size).png()

await render(192).toFile('public/icon-192.png')
await render(512).toFile('public/icon-512.png')

// Maskable icons get cropped to a circle by some launchers, so the mark sits
// at 60% on a full-bleed brand field rather than running to the edge.
const inner = await render(308).toBuffer()
await sharp({
  create: { width: 512, height: 512, channels: 4, background: BRAND },
})
  .composite([{ input: inner, top: 102, left: 102 }])
  .png()
  .toFile('public/icon-maskable.png')

console.log('wrote icon.svg, icon-192.png, icon-512.png, icon-maskable.png')
