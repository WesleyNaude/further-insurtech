/**
 * Haptics.
 *
 * Used only where something actually happened: a tab changed, a trip was
 * verified, a commitment was made. Buzzing on every tap is noise.
 *
 * Browsers refuse navigator.vibrate until the page has had a genuine user
 * gesture, and log an error for every call before then. Since our first buzz
 * can fire from a timer or an effect, we wait for that gesture ourselves rather
 * than filling the console.
 */
let gestured = false

if (typeof window !== 'undefined') {
  const mark = () => {
    gestured = true
    window.removeEventListener('pointerdown', mark)
    window.removeEventListener('keydown', mark)
  }
  window.addEventListener('pointerdown', mark, { once: true })
  window.addEventListener('keydown', mark, { once: true })
}

function buzz(pattern: number | number[]) {
  if (!gestured) return false
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return false
  try {
    return navigator.vibrate(pattern)
  } catch {
    return false
  }
}

export const tap = () => buzz(8)
export const confirm = () => buzz([10, 30, 12])
export const reject = () => buzz([24, 40, 24])
