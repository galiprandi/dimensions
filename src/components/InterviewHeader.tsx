import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft } from 'lucide-react'
import { SeniorityBadge } from '@/components/SeniorityBadge'
import type { DimensionItem, StackItem } from '@/utils/ai'
import { AiOptions } from './ui/ai-options'



export function InterviewHeader({
  interviewId,
  interviewName,
  status,
  isLoading,
  onBack,
  photoURL,
  seniority,
  dimensions,
  stack,
}: HeaderProps) {
  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-border py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Volver al listado de candidatos"
            onClick={onBack}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={photoURL} alt={interviewName} />
              <AvatarFallback>
                {interviewName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-foreground">
                  {isLoading ? <Skeleton className="h-6 w-32" /> : interviewName}
                </span>
                {isLoading ? <Skeleton className="h-6 w-20" /> : <StatusBadge status={status} />}
                {seniority && <SeniorityBadge seniority={seniority} />}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AiOptions
            interviewId={interviewId}
            interviewName={interviewName}
            dimensions={dimensions}
            stack={stack}
          />
        </div>
      </div>
    </div>
  )
}

type HeaderProps = {
  interviewId: string
  interviewName: string
  status: string
  isLoading: boolean
  onBack: () => void
  photoURL: string
  seniority: string
  dimensions: DimensionItem[]
  stack: StackItem[]
}