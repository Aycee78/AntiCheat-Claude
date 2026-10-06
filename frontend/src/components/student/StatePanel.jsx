// Full-width message for loading, empty and error states, so no screen is ever blank.
export function Loading({ children = 'Loading…' }) {
  return (
    <div className="sa-gate" role="status" aria-live="polite">
      <div className="sa-spinner" aria-hidden="true" />
      <p className="sa-muted">{children}</p>
    </div>
  )
}

export function StatePanel({ title, children, action, tone = 'default' }) {
  return (
    <section className="sa-gate">
      <h1 className="sa-title">{title}</h1>
      {children && <p className={tone === 'error' ? 'sa-notice' : 'sa-lead'} role={tone === 'error' ? 'alert' : undefined}>{children}</p>}
      {action}
    </section>
  )
}
