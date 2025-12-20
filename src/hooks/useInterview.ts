import { useQuery } from '@tanstack/react-query'
import { fetchInterviewDetail } from '@/lib/interviewPrompt/fetchDetail'
import type { GraphQLInterviewResponse } from '@/lib/interviewPrompt/types'

type InterviewDetailData = GraphQLInterviewResponse['data']

type Dimension = {
  id: string
  conclusion: string
  dimensionId: string
  dimensionName: string
  area: string
  label: string
  topics: string[]
}

type Stack = {
  id: string
  conclusion: string
  stackId: string
  stackName: string
  label: string
}

type InterviewData = {
  candidate: string
  photoURL: string
  seniority: string
  status: string
  statusLabel: string
  dimensions: Dimension[]
  stack: Stack[]
}

function processInterviewData(rawData: { data: InterviewDetailData | undefined }): InterviewData | undefined {
  if (!rawData?.data?.interview) return undefined

  return {
    candidate: rawData.data.interview.professional?.fullName as string || '',
    photoURL: rawData.data.interview.professional?.photoURL as string || '',
    seniority: rawData.data.interview.professional?.seniority as string || '',
    status: rawData.data.interview.status as string || '',
    statusLabel: (rawData.data.interview.status as string || '') === 'completed' ? 'Completada' : (rawData.data.interview.status as string || '') === 'pending' ? 'Pendiente' : (rawData.data.interview.status as string || '') || '—',
    dimensions: (rawData.data.interview.dimensionEvaluations || [])
      .filter(evaluation => evaluation.conclusion)
      .map(evaluation => {
        const dimension = (rawData.data!.dimensions || []).find(d => d.id === evaluation.dimension?.id)
        const dimensionName = dimension?.name as string || ''
        const capitalizedName = dimensionName.charAt(0).toUpperCase() + dimensionName.slice(1)
        const area = (dimension?.technologyFocus as string || '').charAt(0).toUpperCase() + (dimension?.technologyFocus as string || '').slice(1)
        const topics: string[] = []
        if (Array.isArray(dimension?.subdimensions)) {
          for (const sub of dimension.subdimensions) {
            const desc = typeof sub?.name === 'string' ? sub.name.trim() : ''
            if (desc) topics.push(desc)
          }
        }
        return {
          id: evaluation.id as string,
          conclusion: evaluation.conclusion as string,
          dimensionId: evaluation.dimension?.id as string,
          dimensionName,
          area,
          label: `${capitalizedName} (${area})`,
          topics
        }
      }),
    stack: (rawData.data.interview.mainStackEvaluations || [])
      .filter(evaluation => evaluation.conclusion)
      .map(evaluation => {
        const mainStack = (rawData.data!.mainStacks || []).find(s => s.id === evaluation.mainStack?.id)
        return {
          id: evaluation.id as string,
          conclusion: evaluation.conclusion as string,
          stackId: evaluation.mainStack?.id as string,
          stackName: mainStack?.name as string || '',
          label: mainStack?.name as string || ''
        }
      })
  }
}

export function useInterview(id?: string): { data: InterviewData | undefined; isLoading: boolean } {
  const query = useQuery<InterviewData | undefined, Error>({
    queryKey: ['interview', 'data', id],
    enabled: Boolean(id),
    queryFn: async () => {
      if (!id) throw new Error('No interview id provided')
      const res = await fetchInterviewDetail({ interviewId: id })
      if (!res.ok) throw new Error(res.message || 'No se pudo cargar la entrevista')
      return processInterviewData({ data: res.data.data })
    },
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  })

  return { data: query.data, isLoading: query.isLoading }
}
