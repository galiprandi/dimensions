import { useAIConclusions } from '@/hooks/useAIConclusions'
import { EvaluationItem } from './EvaluationItem'

type AiConclusionsEditorProps = {
  interviewId: string
}

export function AiConclusionsEditor({ interviewId }: AiConclusionsEditorProps) {
  const { dimensions, finalConclusion } = useAIConclusions({ interviewId })

  const items = [...dimensions]
  if (finalConclusion) {
    items.push({
      id: 'final',
      evaluationId: 'final',
      label: 'Conclusión Final',
      conclusion: finalConclusion,
      isFinal: true,
      topics: [],
    })
  }

  if (!items.length) return null

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <EvaluationItem
          key={item.evaluationId}
          mode={item.isFinal ? 'toggle' : 'editOnly'}
          item={item}
        />
      ))}
    </div>
  )
}
