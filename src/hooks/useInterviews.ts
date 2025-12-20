import { useQuery } from '@tanstack/react-query'
import { fetchInterviews } from '@/lib/interviews'
import type { InterviewListResult } from '@/types/interviews'

export function useInterviews() {
  const result = useQuery<InterviewListResult, Error>({
    queryKey: ['interviews'],
    queryFn: async () => {
      const res = await fetchInterviews({ take: 100, skip: 0 })
      return res
    },
    staleTime: 1000 * 60 * 60, // 1h
    refetchOnWindowFocus: false,
  })
  return result
}
