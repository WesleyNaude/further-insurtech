/**
 * Captures the app's screens at 3x for the pitch deck.
 *
 * Drives the real app against the dev server rather than mocking anything, so a
 * screenshot cannot drift from what the product actually does. Start the dev
 * server first, then: npm run shots
 */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const OUT = '/tmp/further-shots'
fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars'],
})

const page = await browser.newPage()
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

// Seed the origin once, then mark it onboarded so every later load lands in the app.
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await wait(2500)
await page.evaluate(() => {
  localStorage.setItem('further.theme', 'dark')
  localStorage.setItem('further.installHint', 'dismissed')
})
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' })
await wait(2500)

// Click through onboarding the way a person does; the store persists on change.
for (let i = 0; i < 4; i++) {
  const clicked = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Skip|Start/.test(x.textContent))
    if (!b) return false
    b.click()
    return true
  })
  if (!clicked) break
  await wait(1200)
}
await wait(1500)

const heading = () => page.evaluate(() => document.querySelector('h1')?.textContent ?? '?')

const shot = async (path, name, prep) => {
  await page.goto('http://localhost:5173' + path, { waitUntil: 'networkidle0' })
  await wait(2600)
  if (prep) await prep()
  await wait(900)
  await page.screenshot({ path: `${OUT}/${name}.png` })
  console.log(name, '->', await heading())
}

await shot('/', 'wallet')
await shot('/journeys', 'journeys')
await shot('/goal', 'saving')
await shot('/source', 'source')

await browser.close()
