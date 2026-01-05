import { AppDialog } from '@/components/ui/app-dialog'
import { useAIConclusions } from '@/hooks/useAIConclusions'
import ReactMarkdown from 'react-markdown'
import { Skeleton } from '@/components/ui/skeleton'

type AiProfileModalProps = {
  interviewId: string | null
  candidateName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AiProfileModal({
  interviewId,
  candidateName,
  open,
  onOpenChange,
}: AiProfileModalProps) {
  const { profileSummary, isLoading } = useAIConclusions({
    interviewId: interviewId!,
    enabled: Boolean(interviewId),
  })

  return (
    <AppDialog open={open} onOpenChange={onOpenChange} title={`Reseña Técnica - ${candidateName}`}>
      {isLoading ? (
        <Skeleton className="h-4 w-full" />
      ) : (
        <ReactMarkdown>{profileSummary || 'No hay resumen disponible.'}</ReactMarkdown>
      )}
    </AppDialog>
  )
}
