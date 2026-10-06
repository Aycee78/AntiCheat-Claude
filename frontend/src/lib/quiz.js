// Normalises the backend's question records (GET /api/sessions/{id}/questions)
// into the shape the exam UI renders. Components never see raw API data, and a
// malformed response fails loudly here instead of crashing mid-render.
//
// Google Form parsing is a separate, admin-side step (lib/quizParser.js) that
// happens before questions are stored; students only ever receive stored questions.

export const SUPPORTED_TYPES = ['multiple_choice', 'checkboxes', 'short_answer', 'paragraph']
const CHOICE_TYPES = ['multiple_choice', 'checkboxes']

export class QuizDataError extends Error {
  constructor(message) {
    super(message)
    this.name = 'QuizDataError'
  }
}

// -> [{ id, position, type, prompt, options, required, supported }]
// Questions with a type this UI cannot render are kept (so numbering matches what
// the admin sees) but flagged `supported: false` and shown as unavailable.
export function normalizeQuestions(raw) {
  if (!Array.isArray(raw)) throw new QuizDataError('The exam questions were in an unexpected format.')

  const questions = raw.map((q, i) => {
    const id = Number(q?.id)
    if (!Number.isInteger(id) || typeof q?.prompt !== 'string') {
      throw new QuizDataError('The exam questions were in an unexpected format.')
    }
    const supported = SUPPORTED_TYPES.includes(q.type)
    const options =
      supported && CHOICE_TYPES.includes(q.type) && Array.isArray(q.options)
        ? q.options.map((o) => String(o))
        : []
    return {
      id,
      position: Number.isFinite(Number(q.position)) ? Number(q.position) : i + 1,
      type: q.type,
      prompt: q.prompt,
      options,
      required: Boolean(q.required),
      supported,
    }
  })

  return questions.sort((a, b) => a.position - b.position)
}

// Saved answers (GET /api/sessions/{id}/answers) -> { [questionId]: value }
export function answersToMap(saved) {
  if (!Array.isArray(saved)) return {}
  return Object.fromEntries(saved.map((a) => [a.question_id, a.value]))
}
