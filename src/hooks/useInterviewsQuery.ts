import { useQuery } from '@tanstack/react-query'
import { fetchInterviews } from '@/lib/interviews'
import type { InterviewListResult } from '@/types/interviews'

export function useInterviewsQuery(search: string) {
  return useQuery<InterviewListResult, Error>({
    queryKey: ['interviews', search],
    queryFn: async () => {
      const res = await fetchInterviews({ search, take: 100, skip: 0 })
      if (!res.ok) {
        throw new Error(res.message || 'No se pudo cargar interviews')
      }
      return { items: res.items, count: res.count }
    },
    staleTime: 1000 * 60 * 60, // 1h
    refetchOnWindowFocus: false,
  })
}
