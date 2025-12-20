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
import { Braces } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ApiInstructions } from '@/components/ApiInstructions'


// Type declaration for Chrome's experimental AI API
declare global {
  const LanguageModel: {
    availability(options?: { languages?: string[] }): Promise<'readily' | 'after-download' | 'no'>
    create(options?: {
      temperature?: number
      topK?: number
      signal?: AbortSignal
      monitor?: (m: { addEventListener(type: 'downloadprogress', listener: (e: { loaded: number }) => void): void }) => void
      initialPrompts?: Array<{
        role: 'system' | 'user' | 'assistant'
        content: string
      }>
    }): Promise<{
      prompt(text: string | Array<{ role: string; content: string | Array<{ type: string; value: unknown }> }>, options?: { responseConstraint?: unknown }): Promise<string>
      append(messages: Array<{ role: string; content: string | Array<{ type: string; value: unknown }> }>): Promise<void>
      destroy(): void
    }>
    params(): Promise<{ defaultTopK: number; maxTopK: number; defaultTemperature: number; maxTemperature: number }>
  }
}

type DimensionItem = {
  label: string
  conclusion: string
}

type StackItem = {
  label: string
  conclusion: string
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
        />


        <EvaluationsList dimensions={dimensions || []} stacks={stack || []} isLoading={isLoading} />
      </div>
    </div>
  )
}

type HeaderProps = {
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
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<string | ReactElement>('')
  const handleGenerate = () => {
    const prompt = generateSystemPrompt(interviewName, dimensions, stack)
    navigator.clipboard.writeText(prompt).then(() => {
      toast.success('Prompt copiado al portapapeles')
    }).catch(() => {
      toast.error('Error al copiar')
    })
  }

  const handleGenerateAI = async () => {
    setDialogOpen(true)
    setAiLoading(true)
    setAiResult('')

    if (!LanguageModel) {
      setAiResult(<ApiInstructions />)
      setAiLoading(false)
      return
    }

    const availability = await LanguageModel.availability({ languages: ['es'] })
    if (availability === 'no') {
      setAiResult('La API de Prompt no es compatible con este dispositivo. Verifica los requisitos de hardware mencionados arriba.')
      setAiLoading(false)
      return
    }

    try {
      let session
      if (availability === 'readily') {
        session = await LanguageModel.create()
      } else {
        setAiResult('Descargando el modelo de IA... Esto puede tardar.')
        session = await LanguageModel.create({
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              setAiResult(`Descargando el modelo... ${Math.round(e.loaded * 100)}%`)
            })
          }
        })
        setAiResult('Modelo descargado. Generando conclusiones...')
      }

      const prompt = generateSystemPrompt(interviewName, dimensions, stack)
      const result = await session.prompt(prompt)
      setAiResult(result)
    } catch (error) {
      setAiResult('Error al generar conclusiones: ' + (error as Error).message)
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-border py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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
          <Button onClick={handleGenerate} variant="outline" size="sm">
            <Braces className="h-4 w-4 mr-2" />
            Prompt
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleGenerateAI}>
                <Braces className="h-4 w-4 mr-2" />
                IA
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generación con IA</DialogTitle>
              </DialogHeader>
              {aiLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="animate-spin" />
                  <p>Generando conclusiones...</p>
                </div>
              ) : (
                <div>
                  {typeof aiResult === 'string' ? (
                    <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
                  ) : (
                    aiResult
                  )}
                  {typeof aiResult === 'string' && aiResult && (
                    <Button onClick={() => navigator.clipboard.writeText(aiResult).then(() => toast.success('Copiado al portapapeles'))} variant="outline" size="sm" className="mt-2">
                      Copiar resultado
                    </Button>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Volver al listado de candidatos"
            onClick={onBack}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
