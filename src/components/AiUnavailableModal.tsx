import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type AiUnavailableModalProps = {
  onClose: () => void
}

export function AiUnavailableModal({ onClose }: AiUnavailableModalProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText('chrome://flags/#prompt-api-for-gemini-nano')
      .then(() => toast.success('Link copiado al portapapeles'))
      .catch(() => toast.error('No se pudo copiar el link'))
  }

  return (
    <DialogContent
      className="max-w-3xl max-h-[80vh] overflow-y-auto"
      onEscapeKeyDown={(e) => e.preventDefault()}
      onPointerDownOutside={(e) => e.preventDefault()}
      onInteractOutside={(e) => e.preventDefault()}
      description="IA no disponible"
    >
      <DialogHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-2 pr-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <DialogTitle>API de IA no disponible</DialogTitle>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Las siguientes son instrucciones para habilitar la API experimental de IA en tu navegador.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            ✕
          </Button>
        </div>
      </DialogHeader>

      <div className="space-y-4 text-sm text-foreground">
        <div className="rounded-md border border-border bg-muted/40 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span>La API de IA experimental de Chrome no está disponible en este dispositivo.</span>
          </div>
          <div className="space-y-2">
            <p className="font-medium">Para habilitarla, sigue estos pasos:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Asegúrate de usar Google Chrome versión 127 o superior.</li>
              <li>
                Ve a:{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-xs">chrome://flags/#prompt-api-for-gemini-nano</code>
                <Button variant="ghost" size="sm" className="ml-2 h-7 px-2" onClick={handleCopy}>
                  Copiar
                </Button>
              </li>
              <li>Habilita la opción "Prompt API for Gemini Nano".</li>
              <li>Reinicia el navegador.</li>
              <li>Asegúrate de que tu dispositivo tenga al menos 8GB de RAM.</li>
            </ol>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
