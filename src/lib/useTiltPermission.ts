import * as React from 'react'

type State = 'unsupported' | 'insecure' | 'granted' | 'needs-permission' | 'denied'

interface OrientationEventCtor {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

/**
 * Device orientation, and the two gates iOS puts in front of it.
 *
 * Safari on iOS 13+ will not give a page the gyroscope unless the user taps to
 * allow it, and will not even offer the prompt outside a secure context. So a
 * card that leans with the handset silently does nothing over plain http on an
 * iPhone, which looks like a broken effect rather than a blocked one.
 *
 * This reports which of those it is, so the card can ask once and otherwise
 * stay quiet.
 */
export function useTiltPermission() {
  const [state, setState] = React.useState<State>('unsupported')

  React.useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setState('unsupported')
      return
    }

    const ctor = window.DeviceOrientationEvent as unknown as OrientationEventCtor

    // Android and desktop Safari expose orientation with no prompt at all.
    if (typeof ctor.requestPermission !== 'function') {
      setState(window.isSecureContext ? 'granted' : 'insecure')
      return
    }

    // iOS. The prompt itself requires a secure context, so say so plainly
    // rather than showing a button that cannot work.
    setState(window.isSecureContext ? 'needs-permission' : 'insecure')
  }, [])

  const request = React.useCallback(async () => {
    const ctor = window.DeviceOrientationEvent as unknown as OrientationEventCtor
    if (typeof ctor.requestPermission !== 'function') return
    try {
      const result = await ctor.requestPermission()
      setState(result === 'granted' ? 'granted' : 'denied')
    } catch {
      setState('denied')
    }
  }, [])

  return { state, request, enabled: state === 'granted' }
}
