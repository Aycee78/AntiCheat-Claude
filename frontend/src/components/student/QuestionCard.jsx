// One question, numbered, with its answer input.
// value: string (multiple_choice / short_answer / paragraph) or string[] (checkboxes)
export default function QuestionCard({ question, index, value, onChange }) {
  const { id, type, prompt, options = [] } = question
  const name = `q-${id}`
  const title = <span className="sa-prompt">{index + 1}. {prompt}</span>

  if (type === 'multiple_choice') {
    return (
      <fieldset className="sa-question">
        <legend>{title}</legend>
        {options.map((opt) => (
          <label key={opt} className="sa-option">
            <input type="radio" name={name} checked={value === opt} onChange={() => onChange(opt)} />
            <span>{opt}</span>
          </label>
        ))}
      </fieldset>
    )
  }

  if (type === 'checkboxes') {
    const picked = Array.isArray(value) ? value : []
    const toggle = (opt) => onChange(picked.includes(opt) ? picked.filter((v) => v !== opt) : [...picked, opt])
    return (
      <fieldset className="sa-question">
        <legend>{title}</legend>
        {options.map((opt) => (
          <label key={opt} className="sa-option">
            <input type="checkbox" name={name} checked={picked.includes(opt)} onChange={() => toggle(opt)} />
            <span>{opt}</span>
          </label>
        ))}
      </fieldset>
    )
  }

  const inputId = `${name}-input`
  return (
    <div className="sa-question">
      <label htmlFor={inputId} className="sa-legend-like">{title}</label>
      {type === 'paragraph' ? (
        <textarea id={inputId} rows={7} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={inputId} type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  )
}