import { useAIConclusions } from '@/hooks/useAIConclusions'
import { EvaluationItem } from './EvaluationItem'

type AiConclusionsEditorProps = {
  interviewId: string
}

export function AiConclusionsEditor({ interviewId }: AiConclusionsEditorProps) {
  const { items } = useAIConclusions({ interviewId })

  if (!items.length) return null

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <EvaluationItem
          key={item.evaluationId}
          mode="editOnly"
          item={item}
          isFinalConclusion={item.type === 'conclusion'}
        />
      ))}
    </div>
  )
}
