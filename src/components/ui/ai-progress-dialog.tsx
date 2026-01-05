import { Check } from 'lucide-react'
import { AppDialog } from '@/components/ui/app-dialog'
import { useAIConclusions } from '@/hooks/useAIConclusions'

type BaseDialogProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

type ProgressDialogProps = BaseDialogProps & { interviewId: string }

export const AiProgressDialog = ({ isOpen, setIsOpen, interviewId }: ProgressDialogProps) => {
  const { status, STEP_LABELS } = useAIConclusions({ interviewId })
  return (
    <AppDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onClose={() => setIsOpen(false)}
      className="w-[30rem] sm:max-w-3xl"
      bodyClassName="space-y-4"
      title="Generando conclusiones con IA"
      description="Generando conclusiones utilizando inteligencia artificial."
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
