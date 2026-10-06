import { Link } from 'react-router-dom'

export default function ComingSoon({ icon, title, text, owner }) {
  return (
    <section className="card center-card">
      <div className="big-icon">{icon}</div>
      <h1>{title}</h1>
      <p className="muted">{text}</p>
      <p className="chip chip-planned">🚧 In progress · {owner}</p>
      <Link to="/" className="btn btn-ghost">← Back home</Link>
    </section>
  )
}
