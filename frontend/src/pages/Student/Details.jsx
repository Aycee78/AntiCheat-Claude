import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { Loading, StatePanel } from '../../components/student/StatePanel'
import { useExamByCode } from '../../components/student/useExamByCode'

// Flowchart: "Enter Student Details" -> POST /api/exams/code/{code}/sessions
//   201 new session · 200 resumed in-progress session · 409 already submitted · 422 validation
// The mockup also shows "Year & Section", but the backend only accepts student_name and
// student_number, so that field is not collected (it would be silently dropped).
export default function Details() {
  const { code } = useParams()
  const nav = useNavigate()
  const { exam, error: loadError, loading } = useExamByCode(code)
  const [form, setForm] = useState({ student_name: '', student_number: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function start(e) {
    e.preventDefault()
    setError('')
    const errs = {}
    if (!form.student_name.trim()) errs.student_name = 'Enter your full name.'
    if (!form.student_number.trim()) errs.student_number = 'Enter your student number.'
    setFieldErrors(errs)
    if (Object.keys(errs).length) return

    setBusy(true)
    try {
      const session = await api(`/exams/code/${encodeURIComponent(code)}/sessions`, {
        method: 'POST',
        body: { student_name: form.student_name.trim(), student_number: form.student_number.trim() },
      })
      nav(`/student/session/${session.id}`, { replace: true })
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])))
      } else {
        setError(err.message) // 404 invalid code, 409 already submitted, network, 5xx
      }
      setBusy(false)
    }
  }

  if (loading) return <Loading>Loading exam…</Loading>
  if (loadError) {
    return (
      <StatePanel title="Exam not available" tone="error" action={<Link className="sa-btn" to="/student">Enter a different code</Link>}>
        {loadError}
      </StatePanel>
    )
  }

  return (
    <section className="sa-narrow">
      <header className="sa-intro">
        <p className="sa-wordmark sa-wordmark-lg" aria-hidden="true">anticheat</p>
        <p className="sa-lead"><strong>Exam:</strong> {exam.title}</p>
      </header>

      <form onSubmit={start} className="sa-form" noValidate>
        <div className="sa-field">
          <label htmlFor="student_name">Student</label>
          <input id="student_name" value={form.student_name} onChange={set('student_name')}
            autoComplete="name" maxLength={255}
            aria-invalid={Boolean(fieldErrors.student_name)} aria-describedby={fieldErrors.student_name ? 'err-name' : undefined} />
          {fieldErrors.student_name && <p id="err-name" className="sa-error-text" role="alert">{fieldErrors.student_name}</p>}
        </div>
        <div className="sa-field">
          <label htmlFor="student_number">Student number</label>
          <input id="student_number" value={form.student_number} onChange={set('student_number')}
            autoComplete="off" maxLength={50}
            aria-invalid={Boolean(fieldErrors.student_number)} aria-describedby={fieldErrors.student_number ? 'err-number' : undefined} />
          {fieldErrors.student_number && <p id="err-number" className="sa-error-text" role="alert">{fieldErrors.student_number}</p>}
        </div>
        <div className="sa-field">
          <label htmlFor="date">Date</label>
          <input id="date" value={today} readOnly />
        </div>
        {error && <p className="sa-notice" role="alert">{error}</p>}
        <button className="sa-btn sa-btn-primary sa-btn-wide" disabled={busy}>
          {busy ? 'Starting…' : 'Start Exam'}
        </button>
      </form>
    </section>
  )
}