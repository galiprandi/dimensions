import { Button } from '@/components/ui/button'
import { RotateCcw, Check } from 'lucide-react'
import { AppDialog } from '@/components/ui/app-dialog'
import { useAIConclusions } from '@/hooks/useAIConclusions'
import { AiConclusionsEditor } from '../AiConclusionsEditor'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'

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
  const { data, status, isAiAvailable, isDownloading, generate, isGenerating } = useAIConclusions({
    interviewId,
  })

  const showDownload = isDownloading
  const hasConclusions = status === 'ready' && Boolean(data) && !showDownload

  const props = {
    interviewId,
    isOpen,
    setIsOpen,
  }

  if (!isAiAvailable) {
    return <AvailabilityDialog {...props} />
  }

  if (showDownload) {
    return <DownloadDialog {...props} />
  }

  if (!hasConclusions) {
    return <ProgressDialog {...props} />
  }

  return <EditorDialog {...props} generate={generate} isGenerating={isGenerating} />
}

const AvailabilityDialog = ({ isOpen, setIsOpen }: BaseDialogProps) => (
  <AppDialog
    open={isOpen}
    onOpenChange={setIsOpen}
    onClose={() => setIsOpen(false)}
    className="w-[50rem] sm:max-w-3xl"
    bodyClassName="space-y-4"
    title="La generación con IA no está disponible."
  >
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
          Asegura recursos: ~22 GB libres en el disco del perfil, RAM de 16 GB o más o GPU con más
          de 4 GB VRAM.
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
  </AppDialog>
)

const DownloadDialog = ({
  isOpen,
  setIsOpen,
  interviewId,
}: BaseDialogProps & { interviewId: string }) => {
  const { downloadProgress } = useAIConclusions({ interviewId })
  return (
    <AppDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onClose={() => setIsOpen(false)}
      className="w-[30rem] p-6"
      bodyClassName="space-y-4"
      title="Descargando modelo de IA…"
    >
      <div className="space-y-3 text-sm">
        <p className="text-base font-medium text-foreground">Descargando modelo de IA…</p>
        <Progress
          value={
            downloadProgress !== null
              ? Math.min(100, Math.max(0, Math.round(downloadProgress * 100)))
              : 0
          }
          className="w-full !max-w-[100vw] bg-gray-200 [&>div]:bg-emerald-300"
          style={{ transition: 'opacity 250ms ease' }}
        />
        <p className="text-xs text-muted-foreground">
          {downloadProgress !== null
            ? `Progreso: ${Math.min(100, Math.max(0, Math.round(downloadProgress * 100)))}% (mantén la pestaña abierta, puede tardar un momento)`
            : 'Preparando descarga…'}
        </p>
      </div>
    </AppDialog>
  )
}

const ProgressDialog = ({
  isOpen,
  setIsOpen,
  interviewId,
}: BaseDialogProps & { interviewId: string }) => {
  const { status } = useAIConclusions({ interviewId })
  return (
    <AppDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onClose={() => setIsOpen(false)}
      className="w-[30rem] sm:max-w-3xl"
      bodyClassName="space-y-4"
      title="Generando conclusiones con IA"
    >
      <div className="space-y-3 text-sm">
        {STEP_LABELS.map((step, idx) => {
          const currentIdx = STEP_LABELS.findIndex((s) => s.activeOn.includes(status))
          const isActive = step.activeOn.includes(status)
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
              <span className={isActive ? 'font-medium' : 'text-muted-foreground'}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </AppDialog>
  )
}

const EditorDialog = ({
  isOpen,
  setIsOpen,
  interviewId,
  generate,
  isGenerating,
}: EditorDialogProps) => {
  return (
    <AppDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onClose={() => setIsOpen(false)}
      className="w-4/5"
      bodyClassName="space-y-4"
      title="Conclusiones generadas"
      actions={
        <Button variant="outline" size="sm" onClick={generate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Spinner className="h-4 w-4 mr-2" />
              Generando...
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4 mr-2" />
              Regenerar
            </>
          )}
        </Button>
      }
    >
      <AiConclusionsEditor interviewId={interviewId} />
    </AppDialog>
  )
}

type BaseDialogProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

type EditorDialogProps = BaseDialogProps & {
  interviewId: string
  generate: () => Promise<void>
  isGenerating: boolean
}
