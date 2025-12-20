import { EvaluationItem } from './EvaluationItem'
import type { AiConclusionItem } from '@/types/ai'

type AiConclusionsEditorProps = {
  items: AiConclusionItem[]
}

export function AiConclusionsEditor({ items }: AiConclusionsEditorProps) {
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
          }}
        />
      ))}
    </div>
  )
}
