import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/student', label: 'Exam' },
  { to: '/admin', label: 'Admin' },
]

export default function Layout() {
  return (
    <div className="shell">
      <div className="blob blob-a" />
      <div className="blob blob-b" />

      <header className="nav">
        <NavLink to="/" className="brand">
          <span className="brand-icon">🛡️</span> AntiCheat
        </NavLink>
        <nav>
          {links.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-link">
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="page">
        <Outlet />
      </main>

      <footer className="footer">
        Built with Laravel + React + Safe Exam Browser · Fair exams for everyone
      </footer>
    </div>
  )
}
