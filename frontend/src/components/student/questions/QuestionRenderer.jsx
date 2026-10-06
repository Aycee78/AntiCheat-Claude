import Checkboxes from './Checkboxes'
import MultipleChoice from './MultipleChoice'
import TextAnswer from './TextAnswer'
import Unsupported from './Unsupported'

// Data-driven: picks the component for a normalized question (see lib/quiz.js).
export default function QuestionRenderer({ question, ...props }) {
  const common = { question, ...props }
  if (!question.supported) return <Unsupported {...common} />
  switch (question.type) {
    case 'multiple_choice': return <MultipleChoice {...common} />
    case 'checkboxes': return <Checkboxes {...common} />
    case 'short_answer': return <TextAnswer {...common} />
    case 'paragraph': return <TextAnswer {...common} multiline />
    default: return <Unsupported {...common} />
  }
}
