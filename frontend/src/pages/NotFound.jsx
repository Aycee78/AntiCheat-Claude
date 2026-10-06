import { Link } from 'react-router-dom'
import bg from '../assets/bg-blue.webp'

export default function NotFound() {
  return (
    <div className="sa">
      <main className="sa-stage" style={{ backgroundImage: `url(${bg})` }}>
        <section className="sa-float" aria-labelledby="nf-title">
          <h1 id="nf-title" className="sa-title">Page not found</h1>
          <p className="sa-lead">That address does not exist. Check the link you were given.</p>
          <Link className="sa-btn sa-btn-primary" to="/">Go to start</Link>
        </section>
      </main>
    </div>
  )
}
