import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { TopicsDialog } from './TopicsDialog'

type EvaluatedDimensionItemProps = {
  item: {
    id: string
    label: string
    conclusion: string
    topics: string[]
  }
}

export function EvaluatedDimensionItem({ item }: EvaluatedDimensionItemProps) {

  const [isEditing, setIsEditing] = useState(false)
  const [localConclusion, setLocalConclusion] = useState(item.conclusion)
  const [copied, setCopied] = useState(false)



  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (variables: { id: string; conclusion: string }) => {
      const trimmedConclusion = variables.conclusion.trim()
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          operationName: 'UpdateDimensionEvaluation',
          variables: { where: { id: variables.id }, data: { conclusion: trimmedConclusion } },
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
    onMutate: () => {
      toast.success('Guardado')
    },
    onError: (error) => {
      toast.error(error.message || 'Error al guardar')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviewDetail'] })
    },
  })

  const handleSave = () => {
    if (localConclusion !== '') {
      mutation.mutate({ id: item.id, conclusion: localConclusion })
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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-lg text-foreground">{item.label}</h3>
        <div className="flex items-center gap-2">
          <TopicsDialog topics={item.topics} title="Tópicos" />
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
          <div className="text-muted-foreground text-sm leading-relaxed p-3 whitespace-pre-wrap">
            {localConclusion || <span className="text-muted-foreground/50 italic">Sin conclusión</span>}
          </div>
        )}
      </div>
    </div>
  )
}
