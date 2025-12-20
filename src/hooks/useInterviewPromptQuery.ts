import { useQuery } from '@tanstack/react-query'
import { fetchInterviewPrompt } from '@/lib/interviewPrompt'
import type { InterviewPromptResult } from '@/types/interviews'

export function useInterviewPromptQuery(interviewId: string, enabled: boolean) {
  return useQuery<InterviewPromptResult, Error>({
    queryKey: ['interviewPrompt', interviewId],
    enabled: Boolean(interviewId && enabled),
    queryFn: async () => {
      const res = await fetchInterviewPrompt({ interviewId })
      return { text: res.text }
    },
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  })
}
