import { useQuery } from '@tanstack/react-query'

export type DimensionProps = {
  title: string
  area: string
  topics: string[]
  label: string
}

const DIMENSION_BY_ID_QUERY = `
  query Dimension($where: DimensionWhereUniqueInput!) {
    dimension(where: $where) {
      id
      name
      technologyFocus
      subdimensions {
        id
        name
        questions
      }
    }
  }
`

type DimensionByIdResponse = {
  data?: {
    dimension?: {
      id?: unknown
      name?: unknown
      technologyFocus?: unknown
      subdimensions?: Array<{
        id?: unknown
        name?: unknown
        questions?: unknown
      }>
    }
  }
  errors?: Array<{ message?: string }>
}

async function fetchDimensionById(id: string): Promise<DimensionProps | null> {
  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      'apollo-require-preflight': 'true',
    },
    credentials: 'include',
    body: JSON.stringify({
      operationName: 'Dimension',
      variables: { where: { id } },
      query: DIMENSION_BY_ID_QUERY,
    }),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const json = (await res.json()) as DimensionByIdResponse
  const dimension = json?.data?.dimension

  if (!dimension || typeof dimension.name !== 'string') return null

  const topics: string[] = []
  if (Array.isArray(dimension.subdimensions)) {
    for (const sub of dimension.subdimensions) {
      const desc =
        typeof sub?.questions === 'string' && sub.questions.trim()
          ? sub.questions.trim()
          : typeof sub?.name === 'string'
            ? sub.name.trim()
            : ''
      if (desc) topics.push(desc)
    }
  }

  const techFocus = typeof dimension.technologyFocus === 'string' ? dimension.technologyFocus : dimension.name

  const capitalizedTitle = dimension.name.charAt(0).toUpperCase() + dimension.name.slice(1)
  const capitalizedArea = techFocus.charAt(0).toUpperCase() + techFocus.slice(1)
  const label = `${capitalizedTitle} (${capitalizedArea})`

  return { title: dimension.name, area: techFocus, topics, label }
}

export function useDimensionById(id: string, enabled = true) {
  return useQuery<DimensionProps | null, Error>({
    queryKey: ['dimension', id],
    enabled: Boolean(id && enabled),
    queryFn: () => fetchDimensionById(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })
}
