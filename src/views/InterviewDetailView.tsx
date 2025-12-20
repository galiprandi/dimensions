import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EvaluatedDimensionsList } from '@/components/EvaluatedDimensionsList'
import { useInterview } from '@/hooks/useInterview'


export function InterviewDetailView() {
  const { id = 'none' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const interviewData = useInterview(id)
  const { candidate = '', status = '', statusLabel = '', dimensions = [], stack = [] } = interviewData || {}

  console.log({ candidate, status, statusLabel, dimensions, stack })
  
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Header
          interviewName={candidate}
          statusLabel={statusLabel}
          onBack={() => navigate('/interviews')}
        />


        <EvaluatedDimensionsList dimensions={dimensions || []} stacks={stack || []} />
      </div>
    </div>
  )
}

type HeaderProps = {
  interviewName: string
  statusLabel: string
  onBack: () => void
}

function Header({
  interviewName,
  statusLabel,
  onBack,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="w-full">
        <p className="text-sm text-muted-foreground">Candidato</p>
        <div className="flex w-full items-center gap-4">
          <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <span>
              {interviewName}
            </span>
            <Badge
              variant="outline"
              className="text-muted-foreground border-border bg-background text-xs"
            >
              {statusLabel}
            </Badge>
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
