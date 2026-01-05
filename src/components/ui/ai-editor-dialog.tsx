import { Button } from '@/components/ui/button'
import { AppDialog } from '@/components/ui/app-dialog'
import { Spinner } from '@/components/ui/spinner'
import { RotateCcw } from 'lucide-react'
import { AiConclusionsEditor } from '../AiConclusionsEditor'

type BaseDialogProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

type EditorDialogProps = BaseDialogProps & {
  interviewId: string
  generate: () => Promise<void>
  isGenerating: boolean
}

export const AiEditorDialog = ({
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
      description="Editando las conclusiones generadas por IA."
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
