import { useNavigate, useParams } from 'react-router-dom'
import { useInterview } from '@/hooks/useInterview'
import { InterviewHeader } from '@/components/InterviewHeader'

export function InterviewAssistant() {
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
        {/* Placeholder: load anything else later. For now we only load useInterview data via header. */}
      </div>
    </div>
  )
}
