import { useState } from 'react'
import { Braces, Brain } from 'lucide-react'
import { useAIConclusions } from '@/hooks/useAIConclusions'
import { generateSystemPrompt, type DimensionItem, type StackItem } from '@/utils/ai'
import { Button } from './button'
import { ButtonGroup, ButtonGroupSeparator } from './button-group'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AiConclusions } from './ai-conclusions'

export function AiOptions({
  interviewId,
  interviewName,
  dimensions = [],
  stack = [],
}: AiOptionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const handleOpen = () => setIsOpen(true)
  const { isAiAvailable, isDownloading, finalConclusion } = useAIConclusions({ interviewId })
  const effectiveOpen = isOpen || isDownloading
  const handleOpenChange = (next: boolean) => setIsOpen(next || isDownloading)

  const handleCopyPrompt = () => {
    const prompt = generateSystemPrompt(interviewName || '', dimensions, stack, finalConclusion)
    if (!prompt.trim()) {
      toast.error('No hay contenido para copiar.')
      return
    }
    navigator.clipboard
      .writeText(prompt)
      .then(() => toast.success('Prompt copiado al portapapeles'))
      .catch(() => toast.error('Error al copiar el prompt'))
  }

  return (
    <>
      <ButtonGroup>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              title="Copiar prompt al portapapeles"
              onClick={handleCopyPrompt}
              variant="outline"
              size="sm"
              className="rounded-r-none border-r-0"
            >
              <Braces className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copia el prompt al portapapeles</p>
          </TooltipContent>
        </Tooltip>
        <ButtonGroupSeparator />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              title="IA"
              onClick={handleOpen}
              variant="default"
              size="sm"
              className="rounded-l-none"
              disabled={!isAiAvailable}
            >
              <Brain className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Generar conclusiones con IA</p>
          </TooltipContent>
        </Tooltip>
      </ButtonGroup>

      <AiConclusions
        interviewId={interviewId}
        isOpen={effectiveOpen}
        setIsOpen={handleOpenChange}
      />
    </>
  )
}

type AiOptionsProps = {
  interviewId: string
  interviewName?: string
  dimensions?: DimensionItem[]
  stack?: StackItem[]
}
