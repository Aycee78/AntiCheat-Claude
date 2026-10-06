import QuestionHeading from './QuestionHeading'

// A stored question whose type this exam UI cannot render. Nothing is guessed.
export default function Unsupported({ question, index, total }) {
  return (
    <div className="sa-question">
      <div className="sa-legend-like">
        <QuestionHeading index={index} total={total} prompt={question.prompt} required={false} />
      </div>
      <p className="sa-notice" role="alert">
        This question cannot be displayed. Tell your proctor, then continue with the other questions.
      </p>
    </div>
  )
}
