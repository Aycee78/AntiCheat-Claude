import { useCallback, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ExamRoomView from '../../components/student/ExamRoomView'
import { Loading, StatePanel } from '../../components/student/StatePanel'
import { useExamSession } from '../../hooks/useExamSession'

// Loads the session, then hands over to the exam view. Every outcome has a screen.
export default function ExamRoom() {
  const { sessionId } = useParams()
  const nav = useNavigate()
  const { status, data, error, reload } = useExamSession(sessionId)
  const toResult = useCallback(() => nav(`/student/session/${sessionId}/result`, { replace: true }), [nav, sessionId])

  useEffect(() => {
    if (status === 'closed') toResult() // already submitted -> confirmation screen
  }, [status, toResult])

  if (status === 'loading' || status === 'closed') return <Loading>Loading exam…</Loading>
  if (status === 'notfound') {
    return (
      <StatePanel title="Exam session not found" tone="error" action={<Link className="sa-btn" to="/student">Back to start</Link>}>
        This exam session does not exist. Check your exam code and start again.
      </StatePanel>
    )
  }
  if (status === 'error') {
    return (
      <StatePanel title="The exam could not be loaded" tone="error" action={<button className="sa-btn sa-btn-primary" onClick={reload}>Try again</button>}>
        {error}
      </StatePanel>
    )
  }
  if (data.questions.length === 0) {
    return (
      <StatePanel title="No questions available">
        This exam has no questions yet. Tell your proctor.
      </StatePanel>
    )
  }

  return (
    <ExamRoomView
      key={sessionId}
      sessionId={sessionId}
      session={data.session}
      questions={data.questions}
      initialAnswers={data.answers}
      offsetMs={data.offsetMs}
      violationCount={data.violationCount}
    />
  )
}
