// Run with:  npm test      (uses Node's built-in test runner, no extra packages)
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ParseError, parseFormSource, toImportPayload } from './quizParser.js'

// Builders that mimic the shape of FB_PUBLIC_LOAD_DATA_.
const opt = (label) => [label]
const other = () => ['', null, null, null, 1]
const item = (title, typeId, { options, required = 1 } = {}) => [
  1, title, null, typeId, typeId === 6 || typeId === 8 ? null : [[99, options, required]],
]
const form = (items, title = 'Midterm Quiz') => [null, ['Be honest.', items, null, null, null, null, null, null, title], 'x', 'Doc title']

const goodItems = () => [
  item('Name', 0),
  item('Explain', 1, { required: 0 }),
  item('2 + 2?', 2, { options: [opt('3'), opt('4')] }),
  item('Primes', 4, { options: [opt('2'), opt('4'), opt('5')], required: 0 }),
  item('Pick one', 3, { options: [opt('a'), opt('b')] }),
]
const html = (data) => `<html><script>var FB_PUBLIC_LOAD_DATA_ = ${JSON.stringify(data)};</script></html>`

test('parses a Google Form page', () => {
  const r = parseFormSource(html(form(goodItems())))
  assert.equal(r.title, 'Midterm Quiz')
  assert.equal(r.description, 'Be honest.')
  assert.deepEqual(r.questions.map((q) => q.type), ['short_answer', 'paragraph', 'multiple_choice', 'checkboxes', 'multiple_choice'])
  assert.deepEqual(r.questions.map((q) => q.required), [true, false, true, false, true])
  assert.deepEqual(r.questions[2].options, ['3', '4'])
})

test('accepts the script line alone, a JSON array, and an array object', () => {
  const data = form(goodItems())
  assert.equal(parseFormSource(`var FB_PUBLIC_LOAD_DATA_ = ${JSON.stringify(data)};`).questions.length, 5)
  assert.equal(parseFormSource(JSON.stringify(data)).questions.length, 5)
  assert.equal(parseFormSource(data).questions.length, 5)
})

test('accepts a ready-made JSON export and defaults required to true', () => {
  const r = parseFormSource(JSON.stringify({ title: 'T', questions: [{ type: 'short_answer', prompt: 'Q1' }] }))
  assert.equal(r.title, 'T')
  assert.equal(r.questions[0].required, true)
})

test('skips unsupported question types and says why', () => {
  const r = parseFormSource(html(form([...goodItems(), item('Rate it', 5), item('Grid', 7), item('When?', 9), item('Upload', 13)])))
  assert.equal(r.questions.length, 5)
  assert.deepEqual(r.skipped.map((s) => s.title), ['Rate it', 'Grid', 'When?', 'Upload'])
  assert.match(r.skipped[0].reason, /linear scale/)
})

test('ignores sections, page breaks, images and videos without reporting them', () => {
  const r = parseFormSource(html(form([item('Section A', 6), ...goodItems(), item('', 8), item('pic', 11), item('vid', 12)])))
  assert.equal(r.questions.length, 5)
  assert.equal(r.skipped.length, 0)
})

test('removes "Other", blank and duplicate options and warns about each', () => {
  const r = parseFormSource(html(form([item('Pick', 2, { options: [opt('a'), opt('b'), opt('a'), opt(''), other()] })])))
  assert.deepEqual(r.questions[0].options, ['a', 'b'])
  assert.equal(r.warnings.length, 3)
})

test('brackets and quotes inside text do not break extraction', () => {
  const r = parseFormSource(html(form(goodItems(), 'Quiz [1] "final" ]; </script>'.replace('</script>', ''))))
  assert.equal(r.title, 'Quiz [1] "final" ];')
  assert.equal(r.questions.length, 5)
})

test('import payload matches what POST /exams/{exam}/questions accepts', () => {
  const payload = toImportPayload(parseFormSource(html(form(goodItems()))))
  assert.deepEqual(Object.keys(payload), ['questions'])
  assert.deepEqual(Object.keys(payload.questions[0]).sort(), ['prompt', 'required', 'type'])
  assert.deepEqual(Object.keys(payload.questions[2]).sort(), ['options', 'prompt', 'required', 'type'])
})

test('rejects bad input with a clear ParseError', () => {
  const fails = (input, pattern) =>
    assert.throws(() => parseFormSource(input), (e) => e instanceof ParseError && pattern.test(e.message + e.problems.join(' ')))
  fails('', /Nothing to parse/)
  fails('hello world', /does not look like a Google Form/)
  fails('{ not json', /could not be read/)
  fails('[1, 2', /could not be read/)
  fails('var FB_PUBLIC_LOAD_DATA_ = [1, [2', /cut off/)
  fails(html(form([])), /no supported questions/)
  fails(html(form([item('Only unsupported', 7)])), /no supported questions/)
  fails(html(form([item('Pick', 2, { options: [opt('only one')] })])), /at least 2 options/)
  fails(html(form([item('', 0)])), /missing question text/)
  fails({ title: 'x' }, /"questions" list/)
})