// Answer helpers. Answer values match the backend: a string for multiple_choice /
// short_answer / paragraph, a string[] for checkboxes, null/absent when unanswered.

export function isAnswered(value) {
  if (Array.isArray(value)) return value.length > 0
  return typeof value === 'string' && value.trim() !== ''
}

// What PUT /sessions/{id}/answers expects for "no answer": null.
export function toPayloadValue(value) {
  if (Array.isArray(value)) return value.length ? value : null
  return isAnswered(value) ? value : null
}

// Only questions the student can actually answer count towards progress.
const answerable = (q) => q.supported

export function countAnswered(questions, answers) {
  return questions.filter((q) => answerable(q) && isAnswered(answers[q.id])).length
}

export function countAnswerable(questions) {
  return questions.filter(answerable).length
}

export function countMissingRequired(questions, answers) {
  return questions.filter((q) => answerable(q) && q.required && !isAnswered(answers[q.id])).length
}
