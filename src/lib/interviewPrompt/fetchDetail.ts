import type { GraphQLInterviewResponse } from './types'
import { INTERVIEW_QUERY } from './graphql'

type FetchInterviewDetailResult =
  | { ok: true; message: string; data: GraphQLInterviewResponse }
  | { ok: false; message: string; data: undefined }

export async function fetchInterviewDetail(params: { interviewId: string }): Promise<FetchInterviewDetailResult> {
  const id = params.interviewId.trim()

  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      'apollo-require-preflight': 'true',
    },
    credentials: 'include',
    body: JSON.stringify({
      operationName: 'Interview',
      variables: { where: { id } },
      query: INTERVIEW_QUERY,
    }),
  })

  if (!res.ok) {
    return { ok: false as const, message: `HTTP ${res.status}`, data: undefined }
  }

  let parsed: GraphQLInterviewResponse
  try {
    parsed = (await res.json()) as GraphQLInterviewResponse
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false as const, message, data: undefined }
  }

  return { ok: true as const, message: '', data: parsed }
}
