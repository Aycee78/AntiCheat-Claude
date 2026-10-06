import { Outlet } from 'react-router-dom'
import { Logo, UserIcon } from './Icons'

// Header from the mockup: [logo anticheat] | [student (icon)].
// Not a link, so a student can't navigate away mid-exam.
export default function StudentLayout() {
  return (
    <div className="sa">
      <header className="sa-header">
        <div className="sa-brand">
          <Logo />
          <span className="sa-wordmark">anticheat</span>
        </div>
        <div className="sa-user">
          <span className="sa-script">student</span>
          <UserIcon />
        </div>
      </header>
      <main className="sa-main">
        <Outlet />
      </main>
    </div>
  )
}
