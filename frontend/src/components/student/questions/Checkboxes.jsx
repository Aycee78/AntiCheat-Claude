import QuestionHeading from './QuestionHeading'

// Many answers. value: string[] | undefined
export default function Checkboxes({ question, index, total, value, onChange }) {
  const picked = Array.isArray(value) ? value : []
  const toggle = (opt) => onChange(picked.includes(opt) ? picked.filter((v) => v !== opt) : [...picked, opt])
  return (
    <fieldset className="sa-question">
      <legend><QuestionHeading index={index} total={total} prompt={question.prompt} required={question.required} /></legend>
      {question.options.map((opt, i) => (
        <label key={i} className={`sa-option ${picked.includes(opt) ? 'is-selected' : ''}`}>
          <input type="checkbox" name={`q-${question.id}`} checked={picked.includes(opt)} onChange={() => toggle(opt)} />
          <span>{opt}</span>
        </label>
      ))}
    </fieldset>
  )
}
