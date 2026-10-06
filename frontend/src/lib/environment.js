// Safe Exam Browser adds "SEB/<version>" to the browser's user agent.
// Used only to skip the "download the launcher" step when the student is already
// inside SEB. It is a convenience, not a security check: SEB does the lockdown.
export const isSafeExamBrowser = () =>
  typeof navigator !== 'undefined' && /\bSEB\/\d/.test(navigator.userAgent)
