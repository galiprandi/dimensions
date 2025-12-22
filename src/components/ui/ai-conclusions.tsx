import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RotateCcw, X, Check } from 'lucide-react'
import { useAIConclusions } from '@/hooks/useAIConclusions'
import { AiConclusionsEditor } from '../AiConclusionsEditor'

type StepLabel = { key: string; label: string; activeOn: readonly string[] }

const STEP_LABELS: readonly StepLabel[] = [
  { key: 'loading-interview', label: 'Cargando entrevista', activeOn: ['loading-interview'] },
  {
    key: 'checking-availability',
    label: 'Verificando disponibilidad de IA',
    activeOn: ['checking-availability'],
  },
  { key: 'fetching-profile', label: 'Obteniendo perfil público', activeOn: ['fetching-profile'] },
  {
    key: 'summarizing-profile',
    label: 'Resumiendo perfil con IA',
    activeOn: ['summarizing-profile'],
  },
  { key: 'generating-prompt', label: 'Generando prompt', activeOn: ['generating-prompt'] },
  {
    key: 'generating-conclusion',
    label: 'Generando conclusiones',
    activeOn: ['generating-conclusion'],
  },
  { key: 'ready', label: 'Conclusiones listas', activeOn: ['ready'] },
]

type AiConclusionsProps = {
  interviewId: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export const AiConclusions = ({ interviewId, isOpen, setIsOpen }: AiConclusionsProps) => {
  const { data, generate, isGenerating, status, isAiAvailable } = useAIConclusions({ interviewId })

  const hasConclusions = status === 'ready' && Boolean(data)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild />
      <DialogContent
        className="max-w-3xl max-h-[80vh] overflow-y-auto"
        aria-describedby="ai-progress-desc"
      >
        <DialogHeader className="flex flex-row items-center justify-between gap-4">
          <DialogTitle>
            {!isAiAvailable
              ? 'La generación con IA no está disponible.'
              : hasConclusions
                ? 'Conclusiones generadas'
                : 'Generando conclusiones con IA'}
          </DialogTitle>

          <div className="flex items-center gap-2">
            {isAiAvailable && (
              <Button variant="outline" size="sm" onClick={generate} disabled={isGenerating}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Generar
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {!isAiAvailable ? (
          <NotAvailable />
        ) : !hasConclusions ? (
          <WorkingProgress stepLabels={STEP_LABELS} currentStatus={status} />
        ) : (
          <AiConclusionsEditor interviewId={interviewId} />
        )}
      </DialogContent>
    </Dialog>
  )
}

type WorkingProgressProps = {
  stepLabels: readonly StepLabel[]
  currentStatus: string
}

const WorkingProgress = ({ stepLabels, currentStatus }: WorkingProgressProps) => (
  <div className="space-y-3 text-sm">
    {stepLabels.map((step, idx) => {
      const currentIdx = stepLabels.findIndex((s) => s.activeOn.includes(currentStatus))
      const isActive = step.activeOn.includes(currentStatus)
      const isCompleted = currentIdx !== -1 && idx < currentIdx

      return (
        <div key={step.key} className="flex items-center gap-3">
          {isActive ? (
            <div className="h-4 w-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : isCompleted ? (
            <div className="h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
              <Check className="h-3 w-3" />
            </div>
          ) : (
            <div className="h-4 w-4 rounded-full bg-muted" />
          )}
          <span className={isActive ? 'font-medium' : 'text-muted-foreground'}>{step.label}</span>
        </div>
      )
    })}
  </div>
)

const NotAvailable = () => (
  <div className="space-y-4 text-sm text-muted-foreground">
    <ol className="list-decimal pl-5 space-y-2">
      <li>
        Usa Chrome de escritorio (v121+) en Windows 10/11, macOS 13+, Linux o Chromebook Plus.
      </li>
      <li>
        Confirma la descarga del modelo cuando el navegador lo pida y habilita permisos de “AI
        features” / “Local model download”.
      </li>
      <li>
        Asegura recursos: ~22 GB libres en el disco del perfil, RAM de 16 GB o más o GPU con más de
        4 GB VRAM.
      </li>
      <li>
        Conexión no medida para bajar el modelo la primera vez (luego puede usar caché). Evita
        incógnito para conservarlo.
      </li>
      <li>Tras cumplir los pasos, vuelve a abrir y pulsa “Generar”.</li>
    </ol>
    <p className="text-xs text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-900/20 rounded px-3 py-2">
      Advertencia: si sigue sin habilitarse, revisa{' '}
      <span className="font-medium">chrome://on-device-internals</span> para ver el estado de
      descarga del modelo.
    </p>
  </div>
)
