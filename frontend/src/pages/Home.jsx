import { Link } from 'react-router-dom'
import StatusPill from '../components/StatusPill'

// Edit these arrays to update the page - no other code needed.
const steps = [
  { icon: '🔒', title: 'Lock', text: 'Students open the exam inside Safe Exam Browser. Other apps are blocked.' },
  { icon: '📝', title: 'Answer', text: 'They take the timed quiz from our React form. One page, no distractions.' },
  { icon: '🚨', title: 'Track', text: 'Every suspicious action is saved to the violation log for the teacher.' },
]

const features = [
  { name: 'Kiosk lockdown', what: 'Blocks browsers, ChatGPT, Word, Notes, PDF viewers', owner: 'Kiosk/Lockdown Dev', status: 'planned' },
  { name: 'Exam form + timer', what: 'Quiz UI, countdown, auto-submit', owner: 'Form/Frontend Dev', status: 'planned' },
  { name: 'Violation log', what: 'Records focus loss and tab switching', owner: 'Backend/Data Lead', status: 'planned' },
  { name: 'Admin dashboard', what: 'Results and violations in one view', owner: 'Admin + UI/UX', status: 'planned' },
]

const statusText = { planned: '🚧 Planned', progress: '⚙️ In progress', done: '✅ Done' }

export default function Home() {
  return (
    <>
      <section className="hero">
        <StatusPill />
        <h1>
          Fair exams. <span className="gradient-text">Zero shortcuts.</span>
        </h1>
        <p className="lead">
          AntiCheat pairs a Laravel + React quiz system with Safe Exam Browser,
          so students can only do one thing: take the exam.
        </p>
        <div className="actions">
          <Link to="/student" className="btn btn-primary">📝 Take an Exam</Link>
          <Link to="/admin" className="btn btn-ghost">📊 Admin Dashboard</Link>
        </div>
      </section>

      <section>
        <h2 className="section-title">How it works</h2>
        <div className="grid">
          {steps.map((s, i) => (
            <article key={s.title} className="card hover">
              <div className="step-num">{i + 1}</div>
              <div className="big-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p className="muted">{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Feature tracker</h2>
        <div className="card table-wrap">
          <table>
            <thead>
              <tr><th>Feature</th><th>What it does</th><th>Owner</th><th>Status</th></tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.name}>
                  <td><strong>{f.name}</strong></td>
                  <td>{f.what}</td>
                  <td>{f.owner}</td>
                  <td><span className={`chip chip-${f.status}`}>{statusText[f.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
