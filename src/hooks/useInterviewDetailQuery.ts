import { useQuery } from '@tanstack/react-query'
import { fetchInterviewDetail } from '@/lib/interviewPrompt/fetchDetail'
import type { GraphQLInterviewResponse } from '@/lib/interviewPrompt/types'

type InterviewDetailData = GraphQLInterviewResponse['data']

export function useInterviewDetailQuery(interviewId: string, enabled: boolean) {
  return useQuery<{ data: InterviewDetailData | undefined }, Error>({
    queryKey: ['interviewDetail', interviewId],
    enabled: Boolean(interviewId && enabled),
    queryFn: async () => {
      const res = await fetchInterviewDetail({ interviewId })
      if (!res.ok) throw new Error(res.message || 'No se pudo cargar la entrevista')
      return { data: res.data.data }
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })
}
