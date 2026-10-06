import { useEffect, useState } from 'react'

// Re-renders on an interval; returns the current time in ms (for "Saved 2 m ago").
export function useNow(intervalMs = 15000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
