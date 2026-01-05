import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AppDialog } from '@/components/ui/app-dialog'
import { ButtonIcon } from '@/components/ui/button-icon'
import { Copy, Check, FileDiff } from 'lucide-react'
import { toast } from 'sonner'
import { TopicsDialog } from './TopicsDialog'
import { API_URL } from '@/lib/api'

type EvaluationItemProps = {
  item: {
    id?: string
    evaluationId?: string
    label: string
    conclusion: string
    topics?: string[]
    stackId?: string
    dimensionId?: string
    isStack?: boolean
    isFinal?: boolean
    currentConclusion?: string
  }
  mode?: 'toggle' | 'editOnly'
  isFinalConclusion?: boolean
}

export function EvaluationItem({
  item,
  mode = 'toggle',
  isFinalConclusion = false,
}: EvaluationItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [localConclusion, setLocalConclusion] = useState(item.conclusion)
  const [copied, setCopied] = useState(false)
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  const queryClient = useQueryClient()

  const evaluationId = item.id || item.evaluationId || ''
  const isStack = item.isStack ?? Boolean(item.stackId && !item.dimensionId)
  const topics = item.topics ?? []
  const trimmedCurrent = (item.currentConclusion ?? '').trim()

  const hasDifference = useMemo(() => {
    const trimmedLocal = localConclusion.trim()
    if (!trimmedCurrent) return false
    return trimmedLocal !== trimmedCurrent
  }, [localConclusion, trimmedCurrent])

  const mutation = useMutation({
    mutationFn: async (variables: { id: string; conclusion: string }) => {
      const trimmedConclusion = variables.conclusion.trim()
      let operationName: string
      let mutationName: string
      let inputType: string
      let updateInput: string
      if (isFinalConclusion) {
        operationName = 'UpdateInterview'
        mutationName = 'updateInterview'
        inputType = 'InterviewWhereUniqueInput!'
        updateInput = 'InterviewUpdateInput!'
      } else {
        operationName = isStack ? 'UpdateMainStackEvaluation' : 'UpdateDimensionEvaluation'
        mutationName = isStack ? 'updateMainStackEvaluation' : 'updateDimensionEvaluation'
        inputType = isStack
          ? 'MainStackEvaluationWhereUniqueInput!'
          : 'DimensionEvaluationWhereUniqueInput!'
        updateInput = isStack
          ? 'MainStackEvaluationUpdateInput!'
          : 'DimensionEvaluationUpdateInput!'
      }
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          accept: '*/*',
          'content-type': 'application/json',
          'apollo-require-preflight': 'true',
        },
        credentials: 'include',
        body: JSON.stringify({
          operationName,
          variables: { where: { id: variables.id }, data: { conclusion: trimmedConclusion } },
          query: `mutation ${operationName}($where: ${inputType}, $data: ${updateInput}) {
            ${mutationName}(where: $where, data: $data) {
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
      queryClient.invalidateQueries({ queryKey: ['interview'] })
    },
  })

  const handleSave = () => {
    if (localConclusion !== '' && evaluationId && evaluationId !== 'final') {
      mutation.mutate({ id: evaluationId, conclusion: localConclusion })
    }
  }

  const handleToggle = (checked: boolean) => {
    if (mode !== 'toggle') return
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
      console.error('Error al copiar:', err)
    }
  }

  return (
    <div className="space-y-3 max-w-[1620px] w-full">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-lg text-foreground">{item.label}</h3>
        <div className="flex items-center gap-2">
          {mode !== 'editOnly' && topics.length > 0 && (
            <TopicsDialog topics={topics} title="Tópicos" />
          )}
          <CompareDialog
            open={isCompareOpen}
            onOpenChange={setIsCompareOpen}
            hasDifference={hasDifference}
            triggerClassName="h-8 w-8 text-muted-foreground hover:text-foreground disabled:opacity-50"
            trimmedCurrent={trimmedCurrent}
            localConclusion={localConclusion}
          />
          <ButtonIcon
            onClick={handleCopy}
            disabled={!localConclusion}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            tooltip="Copiar conclusión generada"
            icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          />
          {mode === 'toggle' ? (
            <>
              <Label
                htmlFor={`edit-${evaluationId}`}
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Editar
              </Label>
              <Switch
                id={`edit-${evaluationId}`}
                checked={isEditing}
                onCheckedChange={handleToggle}
              />
            </>
          ) : (
            <ButtonIcon
              variant="success"
              size="icon"
              onClick={handleSave}
              disabled={
                mutation.isPending ||
                localConclusion.trim().length === 0 ||
                localConclusion.trim() === (item.currentConclusion?.trim() ?? '')
              }
              className="h-9 w-9"
              tooltip="Guardar conclusión"
              icon={<Check className="h-4 w-4" />}
            />
          )}
        </div>
      </div>

      <div className="min-h-[100px]">
        {mode === 'toggle' ? (
          isEditing ? (
            <Textarea
              value={localConclusion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setLocalConclusion(e.target.value)
              }
              onBlur={() => {
                handleSave()
                setIsEditing(false)
              }}
              placeholder="Escribe la conclusión aquí..."
              className="min-h-[120px] resize-none border-0 bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0 p-3"
            />
          ) : (
            <div className="text-muted-foreground text-sm leading-relaxed p-3 whitespace-pre-wrap">
              {localConclusion || (
                <span className="text-muted-foreground/50 italic">Sin conclusión</span>
              )}
            </div>
          )
        ) : (
          <Textarea
            value={localConclusion}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setLocalConclusion(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSave()
              }
            }}
            onBlur={() => handleSave()}
            placeholder="Escribe la conclusión aquí..."
            className="min-h-[140px] resize-none bg-muted/40 focus-visible:ring-0 focus-visible:ring-offset-0 p-3"
          />
        )}
      </div>
    </div>
  )
}

type CompareDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasDifference: boolean
  triggerClassName?: string
  trimmedCurrent: string
  localConclusion: string
}

function CompareDialog({
  open,
  onOpenChange,
  hasDifference,
  triggerClassName,
  trimmedCurrent,
  localConclusion,
}: CompareDialogProps) {
  return (
    <AppDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Comparar conclusiones"
      trigger={
        <ButtonIcon
          variant="ghost"
          size="icon"
          disabled={!hasDifference}
          className={triggerClassName}
          aria-label="Comparar conclusiones"
          tooltip="Comparar conclusión actual vs propuesta del modelo"
          icon={<FileDiff className="h-4 w-4" />}
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Conclusión actual</p>
          <div className="rounded-md border bg-muted/60 p-3 text-sm whitespace-pre-wrap">
            {trimmedCurrent || (
              <span className="text-muted-foreground/60">Sin conclusión guardada</span>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Conclusión del modelo</p>
          <div className="rounded-md border bg-background p-3 text-sm whitespace-pre-wrap">
            {localConclusion.trim() || (
              <span className="text-muted-foreground/60">Sin propuesta</span>
            )}
          </div>
        </div>
      </div>
    </AppDialog>
  )
}
