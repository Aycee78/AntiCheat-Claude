import { Link, Navigate, useParams } from 'react-router-dom'
import { Loading, StatePanel } from '../../components/student/StatePanel'
import { useExamByCode } from '../../components/student/useExamByCode'
import { isSafeExamBrowser } from '../../lib/environment'

// Flowchart: "Lockdown method?" -> Path A (.seb file, recommended) / Path B (Electron shell, fallback).
// Download links come from VITE_SEB_FILE_URL / VITE_SHELL_APP_URL. Nothing is faked when unset.
const SEB_URL = import.meta.env.VITE_SEB_FILE_URL
const SHELL_URL = import.meta.env.VITE_SHELL_APP_URL

function Path({ title, url, label }) {
  return (
    <section className="sa-card">
      <h2 className="sa-card-title">{title}</h2>
      {url ? (
        <a className="sa-btn sa-btn-primary" href={url} download>{label}</a>
      ) : (
        <p className="sa-muted"><em>This download is not available yet. Ask your proctor.</em></p>
      )}
    </section>
  )
}

export default function Launcher() {
  const { code } = useParams()
  const { exam, error, loading } = useExamByCode(code)

  // Already inside Safe Exam Browser: nothing to download, go straight to the details screen.
  if (isSafeExamBrowser()) return <Navigate to={`/student/${encodeURIComponent(code)}/details`} replace />
  if (loading) return <Loading>Loading exam…</Loading>
  if (error) {
    return (
      <StatePanel title="Exam not available" tone="error" action={<Link className="sa-btn" to="/student">Enter a different code</Link>}>
        {error}
      </StatePanel>
    )
  }

  return (
    <section className="sa-narrow">
      <header className="sa-intro">
        <p className="sa-wordmark sa-wordmark-lg" aria-hidden="true">anticheat</p>
        <p className="sa-lead"><strong>Exam:</strong> {exam.title}</p>
        <p className="sa-lead">
          This exam requires a locked environment.<br />Please download the launcher below to begin.
        </p>
      </header>
      <Path title="Path A: Safe Exam Browser (Recommended)" url={SEB_URL} label="Download .seb file" />
      <Path title="Path B: Electron Secure Shell (Fallback)" url={SHELL_URL} label="Download Secure Shell app" />
      {/* Development shortcut only. It is removed from production builds, so a student
          cannot skip the locked environment. */}
      {import.meta.env.DEV && (
        <p className="sa-center-text sa-muted">
          dev only: <Link to={`/student/${encodeURIComponent(code)}/details`}>skip to student details</Link>
        </p>
      )}
    </section>
  )
}