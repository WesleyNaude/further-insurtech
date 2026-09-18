/**
 * Haptics.
 *
 * Used only where something actually happened: a tab changed, a trip was
 * verified, a commitment was made. Buzzing on every tap is noise, and on a
 * device without a motor it is silently nothing, which is fine.
 */
const can = () => typeof navigator !== 'undefined' && 'vibrate' in navigator

export const tap = () => can() && navigator.vibrate(8)
export const confirm = () => can() && navigator.vibrate([10, 30, 12])
export const reject = () => can() && navigator.vibrate([24, 40, 24])
