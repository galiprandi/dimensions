import type { GraphQLInterviewResponse } from './types'

export type DimensionProps = {
  title: string
  area: string
  topics: string[]
}

type DimensionsCatalog = NonNullable<GraphQLInterviewResponse['data']>['dimensions']

/**
 * Returns normalized props for a dimension by id using the dimensions catalog.
 * - title: dimension name
 * - area: dimension name (technology focus placeholder)
 * - topics: array built from subdimension descriptions (questions) or names
 */
export function getDimensionPropsById(
  dimensions: DimensionsCatalog | undefined,
  id: string,
): DimensionProps | null {
  if (!id || !Array.isArray(dimensions)) return null

  const target = dimensions.find((d) => typeof d?.id === 'string' && d.id === id)
  if (!target || typeof target.name !== 'string') return null

  const title = target.name
  const area = target.name

  const topics: string[] = []
  if (Array.isArray(target.subdimensions)) {
    for (const sub of target.subdimensions) {
      const desc =
        typeof sub?.questions === 'string' && sub.questions.trim()
          ? sub.questions.trim()
          : typeof sub?.name === 'string'
            ? sub.name.trim()
            : ''
      if (desc) topics.push(desc)
    }
  }

  return { title, area, topics }
}
