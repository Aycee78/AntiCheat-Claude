import { useEffect, useRef, useState } from 'react'

// Counts down to the SERVER's expires_at. `offsetMs` = serverNow - clientNow,
// so a wrong student clock cannot change the deadline. Display only: the
// backend remains the authority and re-checks on submit.
const secondsLeft = (end, offsetMs) => Math.max(0, Math.ceil((end - (Date.now() + offsetMs)) / 1000))

export function useExamTimer(expiresAt, offsetMs, onExpire) {
  // first value is computed during the first render, so the clock never flashes "--:--"
  const [remaining, setRemaining] = useState(() => (expiresAt ? secondsLeft(Date.parse(expiresAt), offsetMs) : null))
  const expireRef = useRef(onExpire)
  useEffect(() => {
    expireRef.current = onExpire
  })

  useEffect(() => {
    if (!expiresAt) return undefined
    const end = Date.parse(expiresAt)
    let fired = false
    const tick = () => {
      const left = secondsLeft(end, offsetMs)
      setRemaining(left)
      if (left === 0 && !fired) {
        fired = true
        expireRef.current?.()
      }
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [expiresAt, offsetMs])

  return remaining
}

export function formatClock(totalSeconds) {
  if (totalSeconds == null) return '--:--'
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}