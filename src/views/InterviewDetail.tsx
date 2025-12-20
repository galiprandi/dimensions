import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EvaluationsList } from '@/components/EvaluationsList'
import { useInterview } from '@/hooks/useInterview'
import { StatusBadge } from '@/components/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'


export function InterviewDetail() {
  const { id = 'none' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: interviewData, isLoading } = useInterview(id)
  const { candidate = '', status = '', dimensions = [], stack = [] } = interviewData || {}
  
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Header
          interviewName={candidate}
          status={status}
          isLoading={isLoading}
          onBack={() => navigate('/interviews')}
        />


        <EvaluationsList dimensions={dimensions || []} stacks={stack || []} isLoading={isLoading} />
      </div>
    </div>
  )
}

type HeaderProps = {
  interviewName: string
  status: string
  isLoading: boolean
  onBack: () => void
}

function Header({
  interviewName,
  status,
  isLoading,
  onBack,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="w-full">
        <p className="text-sm text-muted-foreground">Candidato</p>
        <div className="flex w-full items-center gap-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <span>
              {isLoading ? <Skeleton className="h-6 w-32" /> : interviewName}
            </span>
            {isLoading ? <Skeleton className="h-6 w-20" /> : <StatusBadge status={status} />}
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Volver al listado de candidatos"
        onClick={onBack}
        className="pl-3"
      >
        ←
      </Button>
    </div>
  )
}
