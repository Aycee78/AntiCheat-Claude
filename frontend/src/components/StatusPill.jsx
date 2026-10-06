import { useEffect, useState } from 'react'
import { api } from '../lib/api'

const labels = {
  checking: 'Checking backend…',
  online: 'Backend online',
  offline: 'Backend offline',
}

export default function StatusPill() {
  const [state, setState] = useState('checking')
  const [ms, setMs] = useState(null)

  useEffect(() => {
    const ctrl = new AbortController()
    const start = performance.now()
    api('/ping', { signal: ctrl.signal })
      .then(() => {
        setMs(Math.round(performance.now() - start))
        setState('online')
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setState('offline')
      })
    return () => ctrl.abort()
  }, [])

  return (
    <span className={`pill pill-${state}`}>
      <span className="dot" />
      {labels[state]}
      {state === 'online' && ms !== null && <em>{ms} ms</em>}
    </span>
  )
}
