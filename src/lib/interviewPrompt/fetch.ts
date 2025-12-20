import { INTERVIEW_QUERY } from './graphql'
import { buildPromptFromResponse } from './buildPrompt'

export async function fetchInterviewPrompt(params: { interviewId: string }) {
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
    return { ok: false as const, text: `Error: respuesta HTTP ${res.status}.` }
  }

  let parsed: unknown
  try {
    parsed = await res.json()
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false as const, text: 'Error: la respuesta no es JSON válido.\n\n' + message }
  }

  return buildPromptFromResponse(parsed)
}
