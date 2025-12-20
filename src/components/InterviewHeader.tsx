import { useState } from 'react'
import type { ReactElement } from 'react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft, Brain, Braces, RotateCcw, Loader2, X, Globe } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'
import { AiUnavailableModal } from '@/components/AiUnavailableModal'
import { AiConclusionsEditor } from '@/components/AiConclusionsEditor'
import { SeniorityBadge } from '@/components/SeniorityBadge'
import { toast } from 'sonner'
import type { AiConclusionItem } from '@/types/ai'
import { useAi } from '@/hooks/useAi'
import { useProfileInsight } from '@/hooks/useProfileInsight'
import { buildJsonPrompt, generateSystemPrompt, stripMarkdownJson, type DimensionItem, type StackItem } from '@/utils/ai'

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
  profileUrl?: string
}

export function InterviewHeader({
  interviewId,
  interviewName,
  status,
  isLoading,
  onBack,
  photoURL,
  seniority,
  dimensions,
  stack,
  profileUrl,
}: HeaderProps) {
  const simulateUnavailable = false
  const [dialogOpen, setDialogOpen] = useState(false)
  const [aiResult, setAiResult] = useState<string | ReactElement>('')
  const [aiParsed, setAiParsed] = useState<AiConclusionItem[]>([])

  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [profileSummary, setProfileSummary] = useState<string>('')

  const profileQuery = useProfileInsight({
    id: interviewId,
    profileUrl,
    roleLabel: 'Frontend/Full Stack',
    targetSeniority: seniority,
  })

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

  const handleGenerateProfile = async () => {
    if (!profileUrl) {
      toast.error('No hay URL de perfil disponible')
      return
    }

    setProfileDialogOpen(true)
    setProfileSummary('')

    if (profileQuery.data) {
      setProfileSummary(profileQuery.data.summary)
      return
    }

    profileQuery
      .refetch()
      .then((res) => {
        if (res.data) {
          setProfileSummary(res.data.summary)
        }
      })
      .catch((err: unknown) => {
        toast.error('Error al generar reseña desde perfil: ' + (err as Error).message)
        setProfileDialogOpen(false)
      })
  }

  const handleGenerateAI = async () => {
    setDialogOpen(true)
    setAiResult('')
    setAiParsed([])

    if (simulateUnavailable || typeof LanguageModel === 'undefined') {
      setAiResult(<AiUnavailableModal onClose={() => setDialogOpen(false)} />)
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
            <Button onClick={handleGenerateProfile} variant="outline" size="sm" className="rounded-none border-r-0" disabled={!profileUrl}>
              <Globe className="h-4 w-4 mr-2" />
              Perfil
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
                  {simulateUnavailable ? (
                    <AiUnavailableModal onClose={() => setDialogOpen(false)} />
                  ) : (
                    <>
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
                        <div className="space-y-3">
                          {aiParsed.length > 0 ? (
                            <AiConclusionsEditor items={aiParsed} dimensions={dimensions} stacks={stack} />
                          ) : typeof aiResult === 'string' ? (
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
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Reseña generada desde perfil</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Reseña técnica inferida del perfil público usando AI.
                  </p>
                </DialogHeader>
                {profileQuery.isFetching ? (
                  <div className="flex flex-col items-center gap-3 py-8 text-sm text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin text-foreground" />
                    <p className="text-center">Generando reseña...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-md border border-border bg-muted/40">
                      <button
                        type="button"
                        className="absolute right-2 top-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                        onClick={() => navigator.clipboard.writeText(profileSummary).then(() => toast.success('Copiado al portapapeles')).catch(() => toast.error('Error al copiar'))}
                      >
                        Copiar
                      </button>
                      <pre className="whitespace-pre-wrap text-sm p-3 pr-14">{profileSummary || 'No se generó reseña aún.'}</pre>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </ButtonGroup>
        </div>
      </div>
    </div>
  )
}
