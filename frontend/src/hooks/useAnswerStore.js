import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'
import { toPayloadValue } from '../lib/answers'

const AUTOSAVE_DELAY_MS = 1200 // wait for a pause in typing
const RETRY_EVERY_MS = 15000 // retry answers that failed to save

const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b)

// Holds the student's answers for the whole exam session and autosaves them:
//   PUT /sessions/{id}/answers  { answers: [{ question_id, value }] }
// Only changed answers are sent, in one request per pause in typing, so the
// backend is not spammed. Failed saves stay "dirty" and are retried.
// Answers live here (not in the question components), so navigating between
// questions never loses them.
export function useAnswerStore({ sessionId, initial, enabled, onRejected }) {
  const [answers, setAnswers] = useState(initial)
  const [save, setSave] = useState({ status: 'idle', at: null }) // idle | saving | saved | error

  const answersRef = useRef(initial)
  const dirty = useRef(new Set())
  const queue = useRef(Promise.resolve(true))
  const rejectedRef = useRef(onRejected)
  useEffect(() => {
    rejectedRef.current = onRejected
  })

  const doSave = useCallback(async () => {
    if (dirty.current.size === 0) return true
    const snapshot = [...dirty.current].map((id) => [id, answersRef.current[id]])
    setSave((s) => ({ ...s, status: 'saving' }))
    try {
      const res = await api(`/sessions/${sessionId}/answers`, {
        method: 'PUT',
        body: { answers: snapshot.map(([id, v]) => ({ question_id: id, value: toPayloadValue(v) })) },
      })
      // keep an answer dirty if the student changed it while the request was in flight
      snapshot.forEach(([id, v]) => {
        if (sameValue(answersRef.current[id], v)) dirty.current.delete(id)
      })
      setSave({ status: 'saved', at: Date.parse(res?.saved_at) || Date.now() })
      return true
    } catch (err) {
      setSave((s) => ({ ...s, status: 'error' }))
      // 409: session already submitted, or past the server's grace period after expiry
      if (err.status === 409) rejectedRef.current?.()
      return false
    }
  }, [sessionId])

  // One save at a time, in order. Resolves true when nothing is left unsaved.
  const saveNow = useCallback(() => {
    queue.current = queue.current.then(doSave, doSave)
    return queue.current
  }, [doSave])

  const setAnswer = useCallback((questionId, value) => {
    answersRef.current = { ...answersRef.current, [questionId]: value }
    dirty.current.add(questionId)
    setAnswers(answersRef.current)
  }, [])

  // debounce: save shortly after the last change
  useEffect(() => {
    if (!enabled || dirty.current.size === 0) return undefined
    const t = setTimeout(saveNow, AUTOSAVE_DELAY_MS)
    return () => clearTimeout(t)
  }, [answers, enabled, saveNow])

  // retry anything that failed
  useEffect(() => {
    if (!enabled) return undefined
    const id = setInterval(saveNow, RETRY_EVERY_MS)
    return () => clearInterval(id)
  }, [enabled, saveNow])

  // closing the tab with unsaved answers: ask first
  useEffect(() => {
    if (!enabled) return undefined
    const warn = (e) => {
      if (dirty.current.size === 0) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [enabled])

  return { answers, setAnswer, saveNow, save }
}
