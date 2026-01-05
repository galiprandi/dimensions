import { EvaluationItem } from './EvaluationItem'
import { Skeleton } from '@/components/ui/skeleton'

type EvaluationsListProps = {
  dimensions: {
    id: string
    conclusion: string
    dimensionId: string
    dimensionName: string
    area: string
    label: string
    topics: string[]
  }[]
  stacks: {
    id: string
    conclusion: string
    stackId: string
    stackName: string
    label: string
  }[]
  finalConclusion?: string
  isLoading?: boolean
  interviewId: string
}

export function EvaluationsList({
  dimensions,
  stacks,
  finalConclusion,
  isLoading,
  interviewId,
}: EvaluationsListProps) {
  const allItems = [
    ...dimensions.map((d) => ({
      id: d.id,
      label: d.label,
      conclusion: d.conclusion,
      topics: d.topics,
      dimensionId: d.dimensionId,
      isFinal: false,
    })),
    ...stacks.map((s) => ({
      id: s.id,
      label: s.label,
      conclusion: s.conclusion,
      topics: [],
      stackId: s.stackId,
      isFinal: false,
    })),
    ...(finalConclusion
      ? [
          {
            id: interviewId,
            label: 'Conclusión Final',
            conclusion: finalConclusion,
            topics: [],
            isFinal: true,
          },
        ]
      : []),
  ]

  if (isLoading) {
    return (
      <div className="relative space-y-4">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-6 w-48" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-6 w-6" />
                </div>
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative space-y-4">
      <div className="space-y-4">
        {allItems?.map((item) => (
          <EvaluationItem key={item.id} item={item} isFinalConclusion={item.isFinal} />
        ))}
      </div>
    </div>
  )
}
