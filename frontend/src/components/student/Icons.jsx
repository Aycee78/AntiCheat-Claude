// Placeholders from the mockup: round logo and round user icon.
export function Logo({ size = 40 }) {
  return (
    <span className="sa-logo" style={{ width: size, height: size }} aria-hidden="true">
      <span style={{ fontSize: size * 0.34 }}>AC</span>
    </span>
  )
}

export function UserIcon() {
  return (
    <svg className="sa-usericon" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="12" cy="12" r="10.5" />
      <circle cx="12" cy="9.5" r="3.2" />
      <path d="M5.8 19c1.4-3 3.6-4.4 6.2-4.4s4.8 1.4 6.2 4.4" />
    </svg>
  )
}
