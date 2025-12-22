import { useAIConclusions } from '@/hooks/useAIConclusions'
import { EvaluationItem } from './EvaluationItem'

type AiConclusionsEditorProps = {
  interviewId: string
}

export function AiConclusionsEditor({ interviewId }: AiConclusionsEditorProps) {
  const { dimensions } = useAIConclusions({ interviewId })

  if (!dimensions.length) return null

  return (
    <div className="space-y-4">
      {dimensions.map((item) => (
        <EvaluationItem
          key={item.evaluationId}
          mode="editOnly"
          item={{
            ...item,
          }}
        />
      ))}
    </div>
  )
}
