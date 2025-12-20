import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { EvaluatedDimensionsList } from '@/components/EvaluatedDimensionsList'
import { useInterviewsQuery } from '@/hooks/useInterviewsQuery'
import { useInterviewDetailQuery } from '@/hooks/useInterviewDetailQuery'

type Props = {
  defaultOutputMessage: string
}

export function InterviewDetailView({ defaultOutputMessage }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading, error } = useInterviewsQuery('')
  const detailQuery = useInterviewDetailQuery(id || '', Boolean(id))

  const interview = useMemo(() => {
    if (!id) return undefined
    return data?.items.find((item) => item.id === id)
  }, [data?.items, id])

  const seniority =
    typeof (interview as { seniority?: unknown } | undefined)?.seniority === 'string'
      ? (interview as { seniority?: string }).seniority?.trim() || ''
      : ''

  const dimensionEvaluations = detailQuery.data?.data?.interview?.dimensionEvaluations
  const topicsToEvaluate = detailQuery.data?.data?.interview?.topicsToEvaluate
  const dimensionsCatalog = detailQuery.data?.data?.dimensions

  const [updatedConclusions, setUpdatedConclusions] = useState<Record<string, string>>({})

  const onUpdate = (id: string, conclusion: string) => {
    setUpdatedConclusions(prev => ({ ...prev, [id]: conclusion }))
  }

  const dimensionNameById = useMemo(() => {
    const map = new Map<string, string>()
    if (Array.isArray(dimensionsCatalog)) {
      for (const d of dimensionsCatalog) {
        const id = typeof d?.id === 'string' ? d.id : ''
        const name = typeof d?.name === 'string' ? d.name : ''
        if (id && name) map.set(id, name)
      }
    }
    return map
  }, [dimensionsCatalog])

  const evaluatedDimensions = useMemo(() => {
    if (!Array.isArray(dimensionEvaluations)) return []
    return dimensionEvaluations
      .map((d) => {
        const id = typeof d?.dimension?.id === 'string' ? d.dimension.id : ''
        const dimEvalId = typeof d?.id === 'string' ? d.id : ''
        const conclusion = updatedConclusions[dimEvalId] || (typeof d?.conclusion === 'string' ? d.conclusion.trim() : '')
        return { id, dimensionEvaluationId: dimEvalId, name: id ? dimensionNameById.get(id) || 'Dimensión sin nombre' : 'Dimensión', conclusion }
      })
      .filter((d) => d.id && d.conclusion)
  }, [dimensionEvaluations, dimensionNameById, updatedConclusions])


  const totalTopics = Array.isArray(topicsToEvaluate) ? topicsToEvaluate.length : 0

  const completedDimensions = Array.isArray(dimensionEvaluations)
    ? dimensionEvaluations.filter(
        (d) => typeof d?.conclusion === 'string' && d.conclusion.trim().length > 0,
      ).length
    : 0

  const progressValue =
    totalTopics > 0 ? Math.round((completedDimensions / totalTopics) * 100) : 0

  const status: string = interview?.status ?? ''

  const statusLabel: string =
    status === 'completed' ? 'Completada' : status === 'pending' ? 'Pendiente' : status || '—'

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Header
          interviewName={interview?.professionalName || '—'}
          seniority={seniority}
          statusLabel={statusLabel}
          status={status}
          progressValue={progressValue}
          onBack={() => navigate('/interviews')}
        />


        {isLoading && <div className="text-sm text-muted-foreground">Cargando entrevista...</div>}
        {error && <div className="text-sm text-destructive">Error: {error.message}</div>}

        {!isLoading && !interview && (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            {defaultOutputMessage || 'No encontramos la entrevista solicitada.'}
          </div>
        )}

        {interview && evaluatedDimensions.length > 0 && (
          <EvaluatedDimensionsList items={evaluatedDimensions} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  )
}

type HeaderProps = {
  interviewName: string
  seniority: string
  status: string
  statusLabel: string
  progressValue: number
  onBack: () => void
}

function Header({
  interviewName,
  seniority,
  status,
  statusLabel,
  progressValue,
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
              {seniority ? ` (${seniority})` : ''}
            </span>
            <Badge
              variant="outline"
              className={`text-xs ${
                status === 'completed'
                  ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                  : status === 'pending'
                    ? 'text-amber-700 border-amber-200 bg-amber-50'
                    : 'text-muted-foreground border-border bg-background'
              }`}
            >
              {statusLabel}
            </Badge>
          </div>
          <div className="flex flex-1 justify-end">
            <Progress
              value={progressValue}
              className="h-1.5 w-full max-w-[4em] bg-muted/60 [&>div]:bg-emerald-200"
            />
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
