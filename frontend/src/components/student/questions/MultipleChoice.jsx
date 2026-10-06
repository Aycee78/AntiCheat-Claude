import QuestionHeading from './QuestionHeading'

// One answer. value: string | undefined
export default function MultipleChoice({ question, index, total, value, onChange }) {
  const name = `q-${question.id}`
  return (
    <fieldset className="sa-question">
      <legend><QuestionHeading index={index} total={total} prompt={question.prompt} required={question.required} /></legend>
      {question.options.map((opt, i) => (
        <label key={i} className={`sa-option ${value === opt ? 'is-selected' : ''}`}>
          <input type="radio" name={name} checked={value === opt} onChange={() => onChange(opt)} />
          <span>{opt}</span>
        </label>
      ))}
    </fieldset>
  )
}
