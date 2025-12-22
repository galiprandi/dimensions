import type { ReactNode } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type AppDialogProps = {
  open: boolean
  onOpenChange?: (open: boolean) => void
  onClose?: () => void
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  trigger?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function AppDialog({
  open,
  onOpenChange,
  onClose,
  title,
  description,
  actions,
  trigger,
  children,
  className,
  bodyClassName,
}: AppDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className={cn(className, 'max-h-[85vh] overflow-hidden')}>
        <DialogHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <DialogTitle>{title}</DialogTitle>
            {description ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onClose?.()
                }}
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className={cn('max-h-[70vh] overflow-y-auto space-y-4', bodyClassName)}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
