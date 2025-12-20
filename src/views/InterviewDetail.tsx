import { useState } from 'react'
import type { ReactElement } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EvaluationsList } from '@/components/EvaluationsList'
import { useInterview } from '@/hooks/useInterview'
import { StatusBadge } from '@/components/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { SeniorityBadge } from '@/components/SeniorityBadge'
import systemPromptGuide from '../../prompts/system-prompt-guide.md?raw'
import aiJsonPromptGuide from '../../prompts/ai-json-conclusions.md?raw'
import { Braces, Brain, RotateCcw } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'
import { ApiInstructions } from '@/components/ApiInstructions'
import { AiConclusionsEditor } from '@/components/AiConclusionsEditor'
import type { AiConclusionItem } from '@/types/ai'
import { useAi } from '@/hooks/useAi'




type DimensionItem = {
  id: string
  dimensionId: string
  label: string
  conclusion: string
  topics?: string[]
}

type StackItem = {
  id: string
  stackId: string
  label: string
  conclusion: string
  topics?: string[]
}

function buildJsonPrompt(candidate: string, dimensions: DimensionItem[], stack: StackItem[]): string {
  const filteredDimensions = dimensions.filter(dim => dim.conclusion.trim().length > 0)
  const filteredStack = stack.filter(s => s.conclusion.trim().length > 0)

  const blocks: string[] = []
  blocks.push(aiJsonPromptGuide.trim())
  blocks.push('')
  blocks.push('Notas del entrevistador:')
  if (candidate.trim()) {
    blocks.push(`Candidato: ${candidate.trim()}`)
  }
  blocks.push('')
  if (filteredDimensions.length > 0) {
    blocks.push('Dimensiones:')
    filteredDimensions.forEach(dim => {
      blocks.push(`- ${dim.label} (id: ${dim.dimensionId})`)
      if (dim.topics && dim.topics.length > 0) {
        blocks.push(`> Tópicos validados: ${dim.topics.join(', ')}`)
      }
      blocks.push(`=> ${dim.conclusion}`)
    })
    blocks.push('')
  }
  if (filteredStack.length > 0) {
    blocks.push('Main stacks (contexto):')
    filteredStack.forEach(s => {
      blocks.push(`- ${s.label} (id: ${s.stackId})`)
      if (s.topics && s.topics.length > 0) {
        blocks.push(`> Tópicos validados: ${s.topics.join(', ')}`)
      }
      blocks.push(`=> ${s.conclusion}`)
    })
  }
  return blocks.join('\n').trim()
}

function stripMarkdownJson(raw: string) {
  const trimmed = raw.trim()
  if (trimmed.startsWith('```')) {
    const withoutFence = trimmed.replace(/^```[a-zA-Z]*\s*/, '').replace(/```$/, '')
    return withoutFence.trim()
  }
  return trimmed
}

function generateSystemPrompt(candidate: string, dimensions: DimensionItem[], stack: StackItem[]): string {
  const filteredDimensions = dimensions.filter(dim => dim.conclusion.trim().length > 0)
  const filteredStack = stack.filter(s => s.conclusion.trim().length > 0)

  let prompt = systemPromptGuide.trim() + '\n\n---\n\n> Las siguientes son notas que he tomado cómo entrevistador/validador técnico en una entrevista 1:1 con el candidato.\n\n'

  if (candidate.trim()) {
    prompt += `## Candidato: ${candidate.trim()}\n\n`
  }

  let sectionNumber = 0

  filteredDimensions.forEach(dim => {
    sectionNumber++
    prompt += `## ${sectionNumber}. ${dim.label}\n\nMis notas son: ${dim.conclusion}\n\n`
  })

  filteredStack.forEach(s => {
    sectionNumber++
    prompt += `## ${sectionNumber}. ${s.label}\n\nMis notas son: ${s.conclusion}\n\n`
  })

  return prompt.trim()
}

export function InterviewDetail() {
  const { id = 'none' } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: interviewData, isLoading } = useInterview(id)
  const { candidate = '', status = '', dimensions = [], stack = [], photoURL = '', seniority = '' } = interviewData || {}
  
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        <Header
          interviewName={candidate}
          status={status}
          isLoading={isLoading}
          onBack={() => navigate('/interviews')}
          photoURL={photoURL}
          seniority={seniority}
          dimensions={dimensions}
          stack={stack}
          interviewId={id}
        />


        <EvaluationsList dimensions={dimensions || []} stacks={stack || []} isLoading={isLoading} />
      </div>
    </div>
  )
}

type HeaderProps = {
  interviewId: string
  interviewName: string
  status: string
  isLoading: boolean
  onBack: () => void
  photoURL: string
  seniority: string
  dimensions: DimensionItem[]
  stack: StackItem[]
}

function Header({
  interviewId,
  interviewName,
  status,
  isLoading,
  onBack,
  photoURL,
  seniority,
  dimensions,
  stack,
}: HeaderProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [aiResult, setAiResult] = useState<string | ReactElement>('')
  const [aiParsed, setAiParsed] = useState<AiConclusionItem[]>([])

  const aiQuery = useAi<AiConclusionItem[]>({
    id: interviewId,
    getPrompt: () => buildJsonPrompt(interviewName, dimensions, stack),
    parseResponse: (raw: string) => {
      const clean = stripMarkdownJson(raw)
      const parsed = JSON.parse(clean)
      const items = Array.isArray(parsed?.items) ? parsed.items : []
      const normalized: AiConclusionItem[] = items
        .map((rawItem: { dimensionId?: unknown; conclusion?: unknown }): AiConclusionItem | null => {
          const candidate = rawItem
          const dimensionId = typeof candidate.dimensionId === 'string' ? candidate.dimensionId.trim() : ''
          const conclusion = typeof candidate.conclusion === 'string' ? candidate.conclusion : ''
          if (!dimensionId || !conclusion) return null
          const dimension = dimensions.find(d => d.dimensionId === dimensionId)
          const stackMatch = stack.find(s => s.stackId === dimensionId)
          const label = dimension?.label || stackMatch?.label || dimensionId
          const evaluationId = dimension?.id || stackMatch?.id || ''
          const isStack = Boolean(stackMatch)
          if (!evaluationId) return null
          return { dimensionId, evaluationId, label, conclusion, isStack }
        })
        .filter((item: AiConclusionItem | null): item is AiConclusionItem => Boolean(item))
      return normalized
    },
  })

  const handleGenerate = () => {
    const prompt = generateSystemPrompt(interviewName, dimensions, stack)
    navigator.clipboard.writeText(prompt).then(() => {
      toast.success('Prompt copiado al portapapeles')
    }).catch(() => {
      toast.error('Error al copiar')
    })
  }

  const handleDialogChange = (next: boolean) => {
    if (next) setDialogOpen(true)
  }

  const handleGenerateAI = async () => {
    setDialogOpen(true)
    setAiResult('')
    setAiParsed([])

    if (!LanguageModel) {
      setAiResult(<ApiInstructions />)
      return
    }

    if (aiQuery.data) {
      setAiResult(aiQuery.data.raw)
      setAiParsed(aiQuery.data.parsed)
      return
    }

    aiQuery
      .refetch()
      .then((res: { data?: { raw: string; parsed: AiConclusionItem[] } }) => {
        if (res.data) {
          setAiResult(res.data.raw)
          setAiParsed(res.data.parsed)
        }
      })
      .catch((err: unknown) => {
        setAiResult('Error al generar conclusiones: ' + (err as Error).message)
      })
  }

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-border py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Volver al listado de candidatos"
            onClick={onBack}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={photoURL} alt={interviewName} />
              <AvatarFallback>
                {interviewName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-foreground">
                  {isLoading ? <Skeleton className="h-6 w-32" /> : interviewName}
                </span>
                {isLoading ? <Skeleton className="h-6 w-20" /> : <StatusBadge status={status} />}
                {seniority && <SeniorityBadge seniority={seniority} />}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ButtonGroup>
            <Button onClick={handleGenerate} variant="outline" size="sm" className="rounded-r-none border-r-0">
              <Braces className="h-4 w-4 mr-2" />
              Prompt
            </Button>
            <ButtonGroupSeparator />
            <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleGenerateAI} className="rounded-l-none">
                  <Brain className="h-4 w-4 mr-2" />
                  IA
                </Button>
              </DialogTrigger>
              <DialogContent
                className="max-w-3xl max-h-[80vh] overflow-y-auto"
                onEscapeKeyDown={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                description="Conclusiones generadas con AI a partir de tus notas"
              >
                <div className="relative">
                  <DialogHeader className="sticky top-0 z-10 flex flex-row items-start justify-between gap-4 pr-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-2">
                    <div className="space-y-1">
                      <DialogTitle>Conclusiones generadas con AI</DialogTitle>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {aiQuery.isFetching
                          ? 'Generando conclusiones a partir de tus notas. Esto puede tomar algunos segundos, no cierres el modal.'
                          : 'Las siguientes son conclusiones redactadas con AI a partir de tus notas. Revisa, ajusta y guarda solo si estás seguro.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAiResult('')
                          setAiParsed([])
                          aiQuery.refetch().then(res => {
                            if (res.data) {
                              setAiResult(res.data.raw)
                              setAiParsed(res.data.parsed)
                            }
                          }).catch((err: unknown) => {
                            setAiResult('Error al generar conclusiones: ' + (err as Error).message)
                          })
                        }}
                        disabled={aiQuery.isFetching}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Generar
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDialogOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </DialogHeader>
                  {aiQuery.isFetching ? (
                    <div className="flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin text-foreground" />
                      <p className="text-center">Generando conclusiones...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {aiParsed.length > 0 ? (
                        <AiConclusionsEditor items={aiParsed} />
                      ) : (
                        <div className="space-y-3">
                          {typeof aiResult === 'string' ? (
                            <div className="relative rounded-md border border-border bg-muted/40">
                              <button
                                type="button"
                                className="absolute right-2 top-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                                onClick={() => navigator.clipboard.writeText(aiResult).then(() => toast.success('Copiado al portapapeles')).catch(() => toast.error('Error al copiar'))}
                              >
                                Copiar
                              </button>
                              <pre className="whitespace-pre-wrap text-sm p-3 pr-14">{aiResult}</pre>
                            </div>
                          ) : (
                            aiResult
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </ButtonGroup>
        </div>
      </div>
    </div>
  )
}
