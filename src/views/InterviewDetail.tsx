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
  const handleGenerate = () => {
    const prompt = generateSystemPrompt(interviewName, dimensions, stack)
    navigator.clipboard.writeText(prompt).then(() => {
      toast.success('Prompt copiado al portapapeles')
    }).catch(() => {
      toast.error('Error al copiar')
    })
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
