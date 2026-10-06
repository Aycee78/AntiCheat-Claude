import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { countAnswerable, countAnswered } from '../../lib/answers'
import { formatClock, useExamTimer } from '../../hooks/useExamTimer'
import { useAnswerStore } from '../../hooks/useAnswerStore'
import { useNow } from '../../hooks/useNow'
import { useViolationMonitor } from '../../hooks/useViolationMonitor'
import Modal from './Modal'
import QuestionRenderer from './questions/QuestionRenderer'

const FINAL_WARNING_MS = 2500 // how long the student sees the last warning before auto-submit
const LOW_TIME_SECONDS = 300

// Flowchart: "Web exam form loads: timer + autosave" -> "Answer questions in web form",
// with its three exits: violations, time runs out, manual submit.
export default function ExamRoomView({ sessionId, session, questions, initialAnswers, offsetMs, violationCount }) {
  const nav = useNavigate()
  const exam = session.exam
  const toResult = useCallback(() => nav(`/student/session/${sessionId}/result`, { replace: true }), [nav, sessionId])

  const [phase, setPhase] = useState('ready') // ready | submitting | submit_failed
  const [current, setCurrent] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [warning, setWarning] = useState(() =>
    // resumed after the limit was already reached (e.g. page refreshed before submit finished)
    exam?.max_violations && violationCount >= exam.max_violations
      ? { count: violationCount, max: exam.max_violations, final: true }
      : null,
  )
  const finishing = useRef(false)
  const lastReason = useRef('manual')
  const panelRef = useRef(null)
  const now = useNow()

  // ---- answers + autosave ----
  // A 409 on autosave means "submitted" or "past the grace period". Only leave if it is submitted:
  // after expiry the timer is already submitting for the student.
  const checkClosed = useCallback(() => {
    api(`/sessions/${sessionId}`).then((s) => s.status !== 'in_progress' && toResult()).catch(() => {})
  }, [sessionId, toResult])
  const { answers, setAnswer, saveNow, save } = useAnswerStore({
    sessionId,
    initial: initialAnswers,
    enabled: phase === 'ready',
    onRejected: checkClosed,
  })

  // ---- submit: POST /sessions/{id}/submit { reason } ----
  const finish = useCallback(
    async (reason) => {
      if (finishing.current) return // one submission at a time
      finishing.current = true
      lastReason.current = reason
      setConfirmOpen(false)
      setWarning(null)
      setSubmitError('')
      setPhase('submitting')
      await saveNow() // best effort: push unsaved answers first
      try {
        for (let attempt = 0; ; attempt++) {
          try {
            await api(`/sessions/${sessionId}/submit`, { method: 'POST', body: { reason } })
            break
          } catch (err) {
            // Backend answers 422 if its clock says time is not up yet; ours may be a moment ahead.
            if (err.status === 422 && reason === 'time_up' && attempt < 6) {
              await new Promise((r) => setTimeout(r, 1000))
              continue
            }
            throw err
          }
        }
        toResult()
      } catch (err) {
        finishing.current = false // allow "Try again"
        setSubmitError(err.message)
        setPhase('submit_failed')
      }
    },
    [sessionId, saveNow, toResult],
  )
  const finishRef = useRef(finish)
  useEffect(() => {
    finishRef.current = finish
  })

  // ---- timer: the server's expires_at is the deadline; time runs out -> auto-submit ----
  const remaining = useExamTimer(
    phase === 'ready' ? session.expires_at : null,
    offsetMs,
    useCallback(() => finishRef.current('time_up'), []),
  )

  // ---- violations: POST /sessions/{id}/violations { type } ----
  const reportViolation = useCallback(
    async (type) => {
      for (let attempt = 0; attempt < 4; attempt++) {
        if (finishing.current) return
        try {
          const r = await api(`/sessions/${sessionId}/violations`, { method: 'POST', body: { type } })
          setWarning({ count: r.violation_count, max: r.max_violations, final: r.limit_reached })
          return
        } catch (err) {
          if (err.status === 409) return toResult() // already submitted
          if (err.status === 422) return // backend rejected the type; retrying will not help
          await new Promise((res) => setTimeout(res, 2000)) // network/5xx: retry so the log is not lost
        }
      }
    },
    [sessionId, toResult],
  )
  useViolationMonitor(phase === 'ready', reportViolation)

  // flowchart: "Max violations reached?" -> Yes -> auto-submit, after the student has seen the warning
  useEffect(() => {
    if (!warning?.final) return undefined
    const t = setTimeout(() => finishRef.current('max_violations'), FINAL_WARNING_MS)
    return () => clearTimeout(t)
  }, [warning])

  // keyboard/screen-reader users: land on the new question after Previous / Next
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    panelRef.current?.focus({ preventScroll: true })
  }, [current])

  // ---- screens other than the exam itself ----
  if (phase === 'submitting') {
    return (
      <section className="sa-gate" role="status" aria-live="polite">
        <h1 className="sa-title">Submitting your exam…</h1>
        <div className="sa-spinner" aria-hidden="true" />
        <p className="sa-lead">Please wait. Do not close the window.</p>
      </section>
    )
  }
  if (phase === 'submit_failed') {
    return (
      <section className="sa-gate">
        <h1 className="sa-title">Your exam has not been submitted yet</h1>
        <p className="sa-notice" role="alert">{submitError}</p>
        <p className="sa-lead">Your saved answers are safe. Check your connection, then try again.</p>
        <button className="sa-btn sa-btn-primary" onClick={() => finish(lastReason.current)}>Try again</button>
      </section>
    )
  }

  // ---- the exam ----
  const total = questions.length
  const q = questions[Math.min(current, total - 1)]
  const answerable = countAnswerable(questions)
  const answered = countAnswered(questions, answers)
  const minsAgo = save.at ? Math.max(0, Math.floor((now - save.at) / 60000)) : 0
  const saveLabel =
    save.status === 'saving' ? 'Saving…'
    : save.status === 'error' ? 'Not saved. Retrying…'
    : save.at ? (minsAgo < 1 ? 'Saved just now' : `Saved ${minsAgo} m ago`)
    : 'Saved automatically'
  const low = remaining != null && remaining <= LOW_TIME_SECONDS
  const timeAnnouncement = remaining == null ? '' : remaining <= 60 ? 'Less than one minute remaining.' : low ? 'Less than five minutes remaining.' : ''

  return (
    <div className="sa-exam">
      <div className="sa-infobar">
        <div><span className="sa-label">Student</span><strong>{session.student_name}</strong></div>
        <div>
          <span className="sa-label">Autosave</span>
          <span className={save.status === 'error' ? 'sa-error-text' : ''} role="status">{saveLabel}</span>
        </div>
        <div className={`sa-timer ${low ? 'is-low' : ''}`}>
          <span className="sa-label">Timer</span>
          <strong role="timer" aria-label="Time remaining">{formatClock(remaining)}</strong>
        </div>
      </div>
      <p className="sa-sr" role="status">{timeAnnouncement}</p>

      <div className="sa-panel" ref={panelRef} tabIndex={-1} role="group" aria-label={`Question ${current + 1} of ${total}`}>
        <QuestionRenderer
          key={q.id}
          question={q}
          index={current}
          total={total}
          value={answers[q.id]}
          onChange={(v) => setAnswer(q.id, v)}
        />
      </div>

      <div className="sa-exam-actions">
        <button className="sa-btn sa-btn-primary" onClick={() => setConfirmOpen(true)}>Submit exam</button>
        <div className="sa-pager">
          <button className="sa-btn" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</button>
          <button className="sa-btn" disabled={current >= total - 1} onClick={() => setCurrent((c) => c + 1)}>Next</button>
        </div>
      </div>

      {warning && (
        <Modal
          alert
          tone="warn"
          title={`Warning ${warning.count} of ${warning.max}`}
          actions={!warning.final && <button className="sa-btn sa-btn-primary" data-autofocus onClick={() => setWarning(null)}>OK, continue</button>}
        >
          <p>You switched tabs or left the exam window. This has been logged.</p>
          {warning.final && <p><strong>Maximum violations reached. Your exam is being submitted.</strong></p>}
        </Modal>
      )}

      {confirmOpen && !warning && (
        <Modal
          title="Are you sure you want to submit?"
          onClose={() => setConfirmOpen(false)}
          actions={
            <>
              <button className="sa-btn" onClick={() => setConfirmOpen(false)}>Cancel</button>
              <button className="sa-btn sa-btn-primary" data-autofocus onClick={() => finish('manual')}>Yes, submit</button>
            </>
          }
        >
          <p>You have answered {answered} of {answerable} questions. You cannot change your answers after this.</p>
        </Modal>
      )}
    </div>
  )
}