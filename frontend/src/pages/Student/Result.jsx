import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { Loading, StatePanel } from '../../components/student/StatePanel'

// Flowchart: "Submission confirmation". The backend records WHY the session ended
// (submit_reason), which selects one of the three mockup screens. There is no
// student-facing score or result endpoint, so none is shown.
const SCREENS = {
  manual: { heading: 'Exam submitted successfully.', big: null },
  time_up: { heading: 'Exam submitted successfully.', big: 'Time is up.' },
  max_violations: { heading: 'Exam auto-submitted.', big: 'Too many violations.' },
}

export default function Result() {
  const { sessionId } = useParams()
  const nav = useNavigate()
  const [state, setState] = useState({ session: null, error: '', status: 0 })

  useEffect(() => {
    let alive = true
    api(`/sessions/${sessionId}`)
      .then((session) => alive && setState({ session, error: '', status: 200 }))
      .catch((err) => alive && setState({ session: null, error: err.message, status: err.status }))
    return () => {
      alive = false
    }
  }, [sessionId])

  function exit() {
    // SEB quits via the "quit URL" in the .seb config. In an ordinary browser window.close()
    // only works for script-opened windows, so fall back to the start page.
    window.close()
    setTimeout(() => nav('/student', { replace: true }), 300)
  }

  if (state.error) {
    return (
      <StatePanel
        title={state.status === 404 ? 'Exam session not found' : 'Could not load your confirmation'}
        tone="error"
        action={<Link className="sa-btn" to="/student">Back to start</Link>}
      >
        {state.error}
      </StatePanel>
    )
  }
  if (!state.session) return <Loading>Loading…</Loading>
  if (state.session.status === 'in_progress') return <Navigate to={`/student/session/${sessionId}`} replace />

  const screen = SCREENS[state.session.submit_reason] ?? SCREENS.manual
  return (
    <section className="sa-gate">
      {screen.big && <p className="sa-big">{screen.big}</p>}
      <h1 className="sa-title">{screen.heading}</h1>
      <p className="sa-lead">Your answers have been saved securely.<br />You may now exit the secure browser.</p>
      <button className="sa-btn sa-btn-primary" onClick={exit}>Exit</button>
    </section>
  )
}
