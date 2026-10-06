// Shared "Question 3 of 10 / prompt / *" block used by every question type.
export default function QuestionHeading({ index, total, prompt, required }) {
  return (
    <>
      <span className="sa-qnum">Question {index + 1} of {total}</span>
      <span className="sa-prompt">
        {prompt}
        {required && <span className="sa-req" aria-hidden="true"> *</span>}
        {required && <span className="sa-sr"> (required)</span>}
      </span>
    </>
  )
}
