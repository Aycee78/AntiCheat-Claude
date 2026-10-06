import { useEffect, useId, useRef } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Accessible dialog: focus moves in, Tab is kept inside, Escape calls onClose
// (only when provided), and focus returns to where it was when the dialog closes.
// Put data-autofocus on the button that should receive focus first.
export default function Modal({ title, children, actions, onClose, tone = 'default', alert = false }) {
  const ref = useRef(null)
  const titleId = useId()
  const bodyId = useId()

  useEffect(() => {
    const previous = document.activeElement
    const el = ref.current
    ;(el.querySelector('[data-autofocus]') ?? el).focus()
    return () => previous?.focus?.()
  }, [])

  function onKeyDown(e) {
    if (e.key === 'Escape' && onClose) {
      e.stopPropagation()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    const items = [...ref.current.querySelectorAll(FOCUSABLE)]
    if (items.length === 0) {
      e.preventDefault()
      return
    }
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="sa-overlay">
      <div
        className={`sa-modal sa-modal-${tone}`}
        role={alert ? 'alertdialog' : 'dialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        ref={ref}
        onKeyDown={onKeyDown}
      >
        <h2 id={titleId}>{title}</h2>
        <div className="sa-modal-body" id={bodyId}>{children}</div>
        <div className="sa-modal-actions">{actions}</div>
      </div>
    </div>
  )
}
