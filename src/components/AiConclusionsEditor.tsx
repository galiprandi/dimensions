import { EvaluationItem } from './EvaluationItem'
import type { AiConclusionItem } from '@/types/ai'

type AiConclusionsEditorProps = {
  items: AiConclusionItem[]
  dimensions: Array<{ id: string; conclusion: string }>
  stacks: Array<{ id: string; conclusion: string }>
}

export function AiConclusionsEditor({ items, dimensions, stacks }: AiConclusionsEditorProps) {
  return (
    <div className="space-y-4">
      {items.map(item => (
        <EvaluationItem
          key={item.evaluationId}
          mode="editOnly"
          item={{
            id: item.evaluationId,
            label: item.label,
            conclusion: item.conclusion,
            topics: [],
            dimensionId: item.isStack ? undefined : item.dimensionId,
            stackId: item.isStack ? item.dimensionId : undefined,
            currentConclusion: item.isStack
              ? stacks.find(stack => stack.id === item.evaluationId)?.conclusion
              : dimensions.find(dimension => dimension.id === item.evaluationId)?.conclusion,
          }}
        />
      ))}
    </div>
  )
}
