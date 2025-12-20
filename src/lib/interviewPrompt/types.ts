export type GraphQLInterviewResponse = {
  data?: {
    interview?: {
      status?: unknown
      professional?: {
        fullName?: unknown
      }
      conclusion?: unknown
      subdimensionsToEvaluate?: Array<{
        subdimension?: {
          dimension?: {
            id?: unknown
          }
        }
      }>
      topicsToEvaluate?: Array<{
        topic?: {
          id?: unknown
          mainStack?: {
            id?: unknown
          }
        }
      }>
      mainStackEvaluations?: Array<{
        id?: unknown
        conclusion?: unknown
        experienceInYears?: unknown
        mainStack?: {
          id?: unknown
        }
      }>
      dimensionEvaluations?: Array<{
        id?: unknown
        conclusion?: unknown
        dimension?: {
          id?: unknown
        }
      }>
    }
    dimensions?: Array<{
      id?: unknown
      name?: unknown
      technologyFocus?: unknown
      subdimensions?: Array<{
        id?: unknown
        name?: unknown
        questions?: unknown
      }>
    }>
    mainStacks?: Array<{
      id?: unknown
      name?: unknown
      topics?: Array<{
        id?: unknown
        name?: unknown
        questions?: unknown
      }>
    }>
  }
  errors?: Array<{
    message?: unknown
  }>
}
