import { useNavigate, useParams } from 'react-router-dom'
import { EvaluationsList } from '@/components/EvaluationsList'
import { useInterview } from '@/hooks/useInterview'
import { InterviewHeader } from '@/components/InterviewHeader'

export function InterviewDetail() {
  const { id = 'none' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: interviewData, isLoading } = useInterview(id)
  const {
    candidate = '',
    status = '',
    dimensions = [],
    stack = [],
    photoURL = '',
    seniority = '',
    conclusion = '',
  } = interviewData || {}

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <InterviewHeader
          interviewName={candidate}
          status={status}
          isLoading={isLoading}
          onBack={() => navigate('/interviews')}
          photoURL={photoURL}
          seniority={seniority}
          dimensions={dimensions}
          stack={stack}
          interviewId={id}
        />

        <EvaluationsList
          dimensions={dimensions || []}
          stacks={stack || []}
          finalConclusion={conclusion}
          isLoading={isLoading}
          interviewId={id}
        />
      </div>
    </div>
  )
}
