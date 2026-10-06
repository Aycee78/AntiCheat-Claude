import { Link } from 'react-router-dom'
import bg from '../assets/bg-blue.webp'
import { Logo } from '../components/student/Icons'

// Mockup screen 1, inside a white floating card on the blue background.
// Everything is stacked and centered: logo, title, tagline, then the
// "Choose your role" box with the two buttons. /admin belongs to the admin
// dashboard; this page only links to it.
// The background is imported (not a CSS url), so a wrong file name or folder
// shows a clear "Failed to resolve import" error instead of a silent blank.
export default function Landing() {
  return (
    <div className="sa">
      <main className="sa-stage" style={{ backgroundImage: `url(${bg})` }}>
        <section className="sa-float sa-float-tall" aria-labelledby="landing-title">
          <Logo size={120} />
          <h1 id="landing-title" className="sa-wordmark sa-wordmark-xl">AntiCheat</h1>
          <p className="sa-tagline">An anti-cheat system for online exams.</p>

          <div className="sa-roles-box">
            <h2 className="sa-subtitle">Choose your role</h2>
            <div className="sa-roles-row">
              <Link className="sa-btn sa-btn-primary" to="/admin">Admin</Link>
              <Link className="sa-btn sa-btn-primary" to="/student">Student</Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}