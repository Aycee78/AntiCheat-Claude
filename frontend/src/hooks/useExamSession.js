import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { answersToMap, normalizeQuestions } from '../lib/quiz'

// Loads everything the exam room needs, and is safe to run again after a refresh:
//   GET /sessions/{id}            session + exam (status, expires_at, max_violations)
//   GET /ping                     server clock, so a wrong student clock can't move the deadline
//   GET /sessions/{id}/questions  409 once the session is submitted
//   GET /sessions/{id}/answers    previously autosaved answers
//   GET /sessions/{id}/violations violations already recorded (to resume at the limit)
//
// status: 'loading' | 'ready' | 'closed' (already submitted) | 'notfound' | 'error'
export function useExamSession(sessionId) {
  const [reloadKey, setReloadKey] = useState(0)
  const key = `${sessionId}:${reloadKey}`
  const [result, setResult] = useState({ key: null, status: 'loading', data: null, error: '' })

  useEffect(() => {
    let alive = true
    const done = (r) => alive && setResult({ key, data: null, error: '', ...r })

    ;(async () => {
      try {
        const sentAt = Date.now()
        const [session, ping] = await Promise.all([api(`/sessions/${sessionId}`), api('/ping')])
        const receivedAt = Date.now()
        if (session.status !== 'in_progress') return done({ status: 'closed' })

        const [rawQuestions, saved, violations] = await Promise.all([
          api(`/sessions/${sessionId}/questions`),
          api(`/sessions/${sessionId}/answers`),
          api(`/sessions/${sessionId}/violations`).catch(() => []), // best effort
        ])

        done({
          status: 'ready',
          data: {
            session,
            questions: normalizeQuestions(rawQuestions),
            answers: answersToMap(saved),
            // server time minus the midpoint of our request window
            offsetMs: Date.parse(ping.time) - (sentAt + receivedAt) / 2,
            violationCount: Array.isArray(violations) ? violations.length : 0,
          },
        })
      } catch (err) {
        if (err.status === 409) return done({ status: 'closed' })
        if (err.status === 404) return done({ status: 'notfound' })
        done({ status: 'error', error: err.message })
      }
    })()

    return () => {
      alive = false
    }
  }, [sessionId, key])

  const loading = result.key !== key
  return {
    status: loading ? 'loading' : result.status,
    data: loading ? null : result.data,
    error: loading ? '' : result.error,
    reload: useCallback(() => setReloadKey((k) => k + 1), []),
  }
}
