import { useAIConclusions } from '@/hooks/useAIConclusions'
import { AiAvailabilityDialog } from './ai-availability-dialog'
import { AiDownloadDialog } from './ai-download-dialog'
import { AiProgressDialog } from './ai-progress-dialog'
import { AiEditorDialog } from './ai-editor-dialog'

type AiConclusionsProps = {
  interviewId: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export const AiConclusions = ({ interviewId, isOpen, setIsOpen }: AiConclusionsProps) => {
  const { data, status, isAiAvailable, isDownloading, generate, isGenerating } = useAIConclusions({
    interviewId,
    enabled: isOpen,
  })

  const showDownload = isDownloading
  const hasConclusions = status === 'ready' && Boolean(data) && !showDownload

  const props = {
    interviewId,
    isOpen,
    setIsOpen,
  }

  if (!isAiAvailable) {
    return <AiAvailabilityDialog {...props} />
  }

  if (showDownload) {
    return <AiDownloadDialog {...props} />
  }

  if (!hasConclusions) {
    return <AiProgressDialog {...props} />
  }

  return <AiEditorDialog {...props} generate={generate} isGenerating={isGenerating} />
}
