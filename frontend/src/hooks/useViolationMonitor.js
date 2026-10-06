import { useEffect, useRef } from 'react'

// Browser-level focus detection only (flowchart: "Switch tab / leave window /
// focus lost?"). Reports 'tab_switch' or 'window_blur' - types the backend
// accepts. OS-level lockdown and 'app_detected' come from SEB / the Electron
// shell, not from React.
const DEBOUNCE_MS = 1500

export function useViolationMonitor(enabled, onViolation) {
  const cb = useRef(onViolation)
  useEffect(() => {
    cb.current = onViolation
  })

  useEffect(() => {
    if (!enabled) return undefined
    let last = 0
    let timer = null

    const report = (type) => {
      const now = Date.now()
      if (now - last < DEBOUNCE_MS) return // one tab switch fires blur + visibilitychange
      last = now
      cb.current(type)
    }
    const onVisibility = () => {
      if (document.hidden) report('tab_switch')
    }
    const onBlur = () => {
      clearTimeout(timer)
      // give visibilitychange a moment so a tab switch is labelled correctly
      timer = setTimeout(() => report(document.hidden ? 'tab_switch' : 'window_blur'), 150)
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
    }
  }, [enabled])
}