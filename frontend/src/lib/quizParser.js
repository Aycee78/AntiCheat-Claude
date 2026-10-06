// Google Form -> AntiCheat questions.  Pure functions, no React.
//
//   parseFormSource(input)  ->  { title, description, questions, skipped, warnings }
//   toImportPayload(parsed) ->  { questions }   (body of POST /api/exams/{exam}/questions)
//
// `input` can be any of:
//   - the HTML of a public Google Form page ("view page source" / Ctrl+U, copied)
//   - just the line  var FB_PUBLIC_LOAD_DATA_ = [...];
//   - the FB_PUBLIC_LOAD_DATA_ array, as JSON text or as an array
//   - a ready-made JSON export:  { "title": "...", "questions": [{ type, prompt, options, required }] }
// Presentation code never sees raw Google Form data.

export const QUESTION_TYPES = ['multiple_choice', 'checkboxes', 'short_answer', 'paragraph']
const CHOICE_TYPES = ['multiple_choice', 'checkboxes']

// Google's internal item type ids inside FB_PUBLIC_LOAD_DATA_.
const SUPPORTED = {
  0: 'short_answer',
  1: 'paragraph',
  2: 'multiple_choice',
  3: 'multiple_choice', // dropdown = single choice
  4: 'checkboxes',
}
const NO_ANSWER = new Set([6, 8, 11, 12]) // section text, page break, image, video: nothing to answer
const UNSUPPORTED = { 5: 'linear scale', 7: 'grid', 9: 'date', 10: 'time', 13: 'file upload', 18: 'rating' }

export class ParseError extends Error {
  constructor(message, problems = []) {
    super(message)
    this.name = 'ParseError'
    this.problems = problems
  }
}

const str = (v) => (v ?? '').toString().trim()

// ---------- reading the page ----------

// Finds `FB_PUBLIC_LOAD_DATA_ = [ ... ]` in pasted text and returns the parsed array.
// Walks the brackets (skipping over strings), so it works with or without the <script> tags.
export function extractFormData(text) {
  const m = /FB_PUBLIC_LOAD_DATA_\s*=\s*/.exec(text)
  if (!m) throw new ParseError('This does not look like a Google Form page.')
  const start = m.index + m[0].length
  if (text[start] !== '[') throw new ParseError('Could not read the Google Form data.')

  let depth = 0
  let inString = false
  let escaped = false
  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (c === '\\') escaped = true
      else if (c === '"') inString = false
      continue
    }
    if (c === '"') inString = true
    else if (c === '[') depth++
    else if (c === ']' && --depth === 0) {
      try {
        return JSON.parse(text.slice(start, i + 1))
      } catch {
        throw new ParseError('Could not read the Google Form data.')
      }
    }
  }
  throw new ParseError('The Google Form data is cut off. Copy the whole page source.')
}

// ---------- validation ----------

// Checks questions against the backend's import rules. Returns a list of problems.
export function validateQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) return ['The form has no supported questions.']
  const problems = []
  questions.forEach((q, i) => {
    const n = i + 1
    if (!QUESTION_TYPES.includes(q.type)) problems.push(`Question ${n}: unsupported type "${q.type}".`)
    if (typeof q.prompt !== 'string' || !q.prompt.trim()) problems.push(`Question ${n}: missing question text.`)
    else if (q.prompt.length > 2000) problems.push(`Question ${n}: text is longer than 2000 characters.`)
    if (CHOICE_TYPES.includes(q.type)) {
      const opts = q.options ?? []
      if (opts.length < 2) problems.push(`Question ${n}: needs at least 2 options.`)
      if (opts.some((o) => typeof o !== 'string' || !o.trim() || o.length > 500))
        problems.push(`Question ${n}: has an empty or too-long option.`)
      if (new Set(opts).size !== opts.length) problems.push(`Question ${n}: has duplicate options.`)
    }
  })
  return problems
}

// ---------- converting ----------

function cleanOptions(raw, n, warnings) {
  const out = []
  let other = false
  let blank = false
  let duplicate = false
  for (const o of Array.isArray(raw) ? raw : []) {
    const label = str(o?.[0])
    if (o?.[4] === 1) other = true // Google's "Other:" free-text option
    else if (!label) blank = true
    else if (out.includes(label)) duplicate = true
    else out.push(label)
  }
  if (other) warnings.push(`Question ${n}: the "Other" option was removed (answers must be one of the listed choices).`)
  if (blank) warnings.push(`Question ${n}: an empty option was removed.`)
  if (duplicate) warnings.push(`Question ${n}: duplicate options were merged.`)
  return out
}

function fromFormData(data) {
  const items = data?.[1]?.[1]
  if (!Array.isArray(items)) throw new ParseError('Unexpected Google Form structure.')

  const questions = []
  const skipped = [] // [{ title, reason }]  questions that exist in the form but cannot be imported
  const warnings = [] // things changed to make a question importable

  for (const item of items) {
    const title = str(item?.[1])
    const typeId = item?.[3]
    if (NO_ANSWER.has(typeId)) continue
    if (UNSUPPORTED[typeId]) {
      skipped.push({ title: title || '(untitled)', reason: `${UNSUPPORTED[typeId]} questions are not supported` })
      continue
    }
    const type = SUPPORTED[typeId]
    const field = item?.[4]?.[0]
    if (!type || !field) {
      if (title) skipped.push({ title, reason: 'unknown question type' })
      continue
    }
    const q = { type, prompt: title, required: Boolean(field[2]) }
    if (CHOICE_TYPES.includes(type)) q.options = cleanOptions(field[1], questions.length + 1, warnings)
    questions.push(q)
  }

  return finish({
    title: str(data?.[1]?.[8]) || str(data?.[3]),
    description: str(data?.[1]?.[0]),
    questions,
    skipped,
    warnings,
  })
}

// A ready-made export: { title, description, questions: [{ type, prompt, options, required }] }
function fromExport(obj) {
  if (!Array.isArray(obj?.questions)) throw new ParseError('The JSON must contain a "questions" list.')
  const questions = obj.questions.map((q) => ({
    type: q?.type,
    prompt: str(q?.prompt),
    required: q?.required === undefined ? true : Boolean(q.required),
    ...(CHOICE_TYPES.includes(q?.type) ? { options: (Array.isArray(q.options) ? q.options : []).map(str) } : {}),
  }))
  return finish({ title: str(obj.title), description: str(obj.description), questions, skipped: [], warnings: [] })
}

function finish(result) {
  const problems = validateQuestions(result.questions)
  if (problems.length) throw new ParseError('The form could not be converted.', problems)
  return result
}

// ---------- public API ----------

export function parseFormSource(input) {
  if (Array.isArray(input)) return fromFormData(input)
  if (input && typeof input === 'object') return fromExport(input)
  if (typeof input !== 'string' || !input.trim()) {
    throw new ParseError('Nothing to parse. Paste the Google Form page source or a JSON export.')
  }

  const text = input.trim()
  if (text.includes('FB_PUBLIC_LOAD_DATA_')) return fromFormData(extractFormData(text))
  if (text[0] === '[' || text[0] === '{') {
    let json
    try {
      json = JSON.parse(text)
    } catch {
      throw new ParseError('That looks like JSON, but it could not be read.')
    }
    return Array.isArray(json) ? fromFormData(json) : fromExport(json)
  }
  throw new ParseError('This does not look like a Google Form page.')
}

export const parseGoogleForm = parseFormSource // earlier name, kept so nothing breaks

// Body for POST /api/exams/{exam}/questions
export const toImportPayload = (parsed) => ({ questions: parsed.questions })