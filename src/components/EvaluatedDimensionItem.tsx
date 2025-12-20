import { useState } from 'react'
import { useDimensionById } from '@/hooks/useDimensionById'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Copy, Check } from 'lucide-react'

type EvaluatedDimensionItemProps = {
  item: { id: string; dimensionEvaluationId: string; name: string; conclusion: string }
  onUpdate?: (id: string, conclusion: string) => void
  showToast: (message: string) => void
}

export function EvaluatedDimensionItem({ item, onUpdate, showToast }: EvaluatedDimensionItemProps) {
  const { data, isLoading } = useDimensionById(item.id)

  const [isEditing, setIsEditing] = useState(false)
  const [localConclusion, setLocalConclusion] = useState(item.conclusion)
  const [copied, setCopied] = useState(false)

  const displayName = isLoading ? item.name : data?.title || item.name

  const capitalizedDisplayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (variables: { id: string; conclusion: string }) => {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          operationName: 'UpdateDimensionEvaluation',
          variables: { where: { id: variables.id }, data: { conclusion: variables.conclusion } },
          query: `mutation UpdateDimensionEvaluation($where: DimensionEvaluationWhereUniqueInput!, $data: DimensionEvaluationUpdateInput!) {
            updateDimensionEvaluation(where: $where, data: $data) {
              conclusion
              __typename
            }
          }`,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      if (json.errors) throw new Error(json.errors[0].message)
      return json
    },
    onMutate: (variables) => {
      // Optimistic update
      onUpdate?.(variables.id, variables.conclusion)
      showToast('Guardado')
    },
    onError: (error) => {
      showToast(error.message || 'Error al guardar')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewDetail'] })
    },
  })

  const handleSave = () => {
    if (localConclusion !== item.conclusion) {
      mutation.mutate({ id: item.dimensionEvaluationId, conclusion: localConclusion })
    }
  }

  const handleToggle = (checked: boolean) => {
    setIsEditing(checked)
    if (!checked) {
      handleSave()
    }
  }

  const handleCopy = async () => {
    if (!localConclusion) return
    try {
      await navigator.clipboard.writeText(localConclusion)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Error al copiar:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-lg text-foreground">{data?.label || capitalizedDisplayName}</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            disabled={!localConclusion || isEditing}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Label htmlFor={`edit-${item.id}`} className="text-sm text-muted-foreground cursor-pointer">
            Editar
          </Label>
          <Switch id={`edit-${item.id}`} checked={isEditing} onCheckedChange={handleToggle} />
        </div>
      </div>

      <div className="min-h-[100px]">
        {isEditing ? (
          <Textarea
            value={localConclusion}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLocalConclusion(e.target.value)}
            onBlur={() => { handleSave(); setIsEditing(false) }}
            placeholder="Escribe la conclusión aquí..."
            className="min-h-[120px] resize-none border-0 bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0 p-3"
          />
        ) : (
          <div className="text-muted-foreground leading-relaxed p-3 whitespace-pre-wrap">
            {item.conclusion || <span className="text-muted-foreground/50 italic">Sin conclusión</span>}
          </div>
        )}
      </div>
    </div>
  )
}
