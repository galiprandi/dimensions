export type InterviewListItem = {
  id: string
  candidate: string
  status: string
  profile: string
}

export type InterviewListResult = InterviewListItem[]

export type InterviewPromptResult = {
  text: string
}
