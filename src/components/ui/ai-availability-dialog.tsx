import { AppDialog } from '@/components/ui/app-dialog'

type BaseDialogProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export const AiAvailabilityDialog = ({ isOpen, setIsOpen }: BaseDialogProps) => (
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
