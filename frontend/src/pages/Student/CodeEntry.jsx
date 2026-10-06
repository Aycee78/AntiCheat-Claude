import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'

// Flowchart: "Student enters exam code" -> GET /api/exams/code/{code}
export default function CodeEntry() {
  const nav = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const clean = code.trim().toUpperCase()
    if (!clean) return setError('Enter your exam code.')
    setBusy(true)
    setError('')
    try {
      await api(`/exams/code/${encodeURIComponent(clean)}`)
      nav(`/student/${encodeURIComponent(clean)}/launch`)
    } catch (err) {
      setError(
        err.status === 404
          ? 'That exam code is not valid, or the exam is not open yet. Check the code and try again.'
          : err.message,
      )
      setBusy(false)
    }
  }

  return (
    <section className="sa-gate">
      <p className="sa-wordmark sa-wordmark-xl" aria-hidden="true">anticheat</p>
      <form onSubmit={submit} className="sa-form sa-form-center" noValidate>
        <label htmlFor="code" className="sa-title">Enter exam code</label>
        <input
          id="code"
          className="sa-code-input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={12}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'code-error' : undefined}
          autoFocus
        />
        {error && <p id="code-error" className="sa-notice" role="alert">{error}</p>}
        <button className="sa-btn sa-btn-primary" disabled={busy}>
          {busy ? 'Checking…' : 'Continue'}
        </button>
      </form>
    </section>
  )
}
