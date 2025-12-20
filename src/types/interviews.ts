export type InterviewListItem = {
  id: string
  professionalName: string
  status: string
  complete: boolean
  deepProfile: boolean
  seniority?: string
}

export type InterviewListResult = {
  items: InterviewListItem[]
  count: number
}

export type InterviewPromptResult = {
  text: string
}
