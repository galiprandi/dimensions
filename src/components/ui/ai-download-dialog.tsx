import { AppDialog } from '@/components/ui/app-dialog'
import { Progress } from '@/components/ui/progress'
import { useAIConclusions } from '@/hooks/useAIConclusions'

type BaseDialogProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

type DownloadDialogProps = BaseDialogProps & { interviewId: string }

export const AiDownloadDialog = ({ isOpen, setIsOpen, interviewId }: DownloadDialogProps) => {
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
