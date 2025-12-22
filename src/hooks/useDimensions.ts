import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

type Subdimension = {
  id: string
  name: string
  description: string | null
  questions: string | null
}

type Dimension = {
  id: string
  name: string
  technologyFocus: string
  subdimensions: Subdimension[]
}

type GraphQLResponse = {
  data?: {
    dimensions?: Dimension[]
  }
  errors?: Array<{ message?: string }>
}

const DIMENSIONS_QUERY = `
  query Dimensions {
    dimensions {
      id
      name
      technologyFocus
      subdimensions {
        id
        name
        description
        questions
      }
    }
  }
`

export function useDimensions(enabled = true) {
  const query = useQuery<Dimension[] | undefined, Error>({
    queryKey: ['dimensions'],
    enabled,
    staleTime: 1000 * 60 * 10,
    queryFn: async () => {
      const payload = {
        query: DIMENSIONS_QUERY,
        variables: {},
        operationName: 'Dimensions',
      }
      const response = await apiClient.post<GraphQLResponse>('', payload, {
        withCredentials: true,
      })

      if (response.data.errors?.length) {
        throw new Error(response.data.errors[0].message || 'GraphQL error')
      }

      return response.data.data?.dimensions ?? []
    },
  })

  return {
    dimensions: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    getById: (id?: string) => (query.data ?? []).find((d) => d.id === id),
  }
}
