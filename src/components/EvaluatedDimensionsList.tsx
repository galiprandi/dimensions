import { useRef, useState } from 'react'
import { EvaluatedDimensionItem } from './EvaluatedDimensionItem'

type EvaluatedDimensionsListProps = {
  items: Array<{ id: string; dimensionEvaluationId: string; name: string; conclusion: string }>
  onUpdate?: (id: string, conclusion: string) => void
}

export function EvaluatedDimensionsList({ items, onUpdate }: EvaluatedDimensionsListProps) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null)
  const toastIdRef = useRef(0)

  const showToast = (message: string) => {
    toastIdRef.current += 1
    const id = toastIdRef.current
    setToast({ id, message })
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current))
    }, 2000)
  }

  return (
    <div className="relative space-y-4">
      <div className="space-y-4">
        {items.map((d) => (
          <EvaluatedDimensionItem key={d.id} item={d} onUpdate={onUpdate} showToast={showToast} />
        ))}
      </div>
      {toast && (
        <div className="mt-4 p-2 bg-background border rounded shadow-sm text-sm text-foreground">
          {toast.message}
        </div>
      )}
    </div>
  )
}
