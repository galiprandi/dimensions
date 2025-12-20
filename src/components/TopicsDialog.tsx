import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { HelpCircle } from 'lucide-react'

interface TopicsDialogProps {
  topics: string[]
  title?: string
  icon?: React.ComponentType<{ className?: string }>
}

export function TopicsDialog({
  topics,
  title = "Tópicos",
  icon: Icon = HelpCircle
}: TopicsDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Icon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          <ul className="space-y-1">
            {topics && topics.length > 0 ? (
              topics.map((topic, index) => (
                <li key={index} className="rounded-lg px-3 py-1 text-sm hover:bg-muted/50 transition-colors">
                  <span className="text-foreground">{topic}</span>
                </li>
              ))
            ) : (
              <li className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground">
                No topics available
              </li>
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
