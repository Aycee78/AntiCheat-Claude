import QuestionHeading from './QuestionHeading'

// short_answer (single line) and paragraph (multi-line). value: string | undefined
export default function TextAnswer({ question, index, total, value, onChange, multiline }) {
  const id = `q-${question.id}-input`
  return (
    <div className="sa-question">
      <label htmlFor={id} className="sa-legend-like">
        <QuestionHeading index={index} total={total} prompt={question.prompt} required={question.required} />
      </label>
      {multiline ? (
        <textarea id={id} rows={8} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  )
}
