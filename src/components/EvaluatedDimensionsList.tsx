import { EvaluatedDimensionItem } from './EvaluatedDimensionItem'

type EvaluatedDimensionsListProps = {
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
}

export function EvaluatedDimensionsList({ dimensions, stacks }: EvaluatedDimensionsListProps) {
  const allItems = [
    ...dimensions.map(d => ({ id: d.id, label: d.label, conclusion: d.conclusion, topics: d.topics, dimensionId: d.dimensionId })),
    ...stacks.map(s => ({ id: s.id, label: s.label, conclusion: s.conclusion, topics: [], stackId: s.stackId }))
  ]

  return (
    <div className="relative space-y-4">
      <div className="space-y-4">
        {allItems?.map((item) => (
          <EvaluatedDimensionItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
