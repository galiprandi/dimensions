import { apiClient } from '../api'
import { INTERVIEW_QUERY } from './graphql'
import { buildPromptFromResponse } from './buildPrompt'

export async function fetchInterviewPrompt(params: { interviewId: string }) {
  const id = params.interviewId.trim()

  try {
    const res = await apiClient.post('', {
      operationName: 'Interview',
      variables: { where: { id } },
      query: INTERVIEW_QUERY,
    })
    return buildPromptFromResponse(res.data)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false as const, text: 'Error: la respuesta no es JSON válido.\n\n' + message }
  }
}
