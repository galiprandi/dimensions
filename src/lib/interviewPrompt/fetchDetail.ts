import { apiClient } from '../api'
import type { GraphQLInterviewResponse } from './types'
import { INTERVIEW_QUERY } from './graphql'

type FetchInterviewDetailResult =
  | { ok: true; message: string; data: GraphQLInterviewResponse }
  | { ok: false; message: string; data: undefined }

export async function fetchInterviewDetail(params: { interviewId: string }): Promise<FetchInterviewDetailResult> {
  const id = params.interviewId.trim()

  try {
    const res = await apiClient.post('', {
      operationName: 'Interview',
      variables: { where: { id } },
      query: INTERVIEW_QUERY,
    })
    return { ok: true as const, message: '', data: res.data as GraphQLInterviewResponse }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false as const, message, data: undefined }
  }
}
