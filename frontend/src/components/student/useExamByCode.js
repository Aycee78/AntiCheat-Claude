import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

// Loads the published exam for a code (GET /api/exams/code/{code}).
export function useExamByCode(code) {
  const [result, setResult] = useState({ code: null, exam: null, error: '' })

  useEffect(() => {
    let alive = true
    api(`/exams/code/${encodeURIComponent(code)}`)
      .then((exam) => alive && setResult({ code, exam, error: '' }))
      .catch((err) =>
        alive &&
        setResult({
          code,
          exam: null,
          error: err.status === 404 ? 'That exam code is not valid, or the exam is not open.' : err.message,
        }),
      )
    return () => {
      alive = false
    }
  }, [code])

  const loading = result.code !== code
  return { exam: loading ? null : result.exam, error: loading ? '' : result.error, loading }
}