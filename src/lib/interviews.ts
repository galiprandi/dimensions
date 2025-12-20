export type InterviewListItem = {
  id: string
  professionalName: string
  status: string
  complete: boolean
  deepProfile: boolean
}


const INTERVIEWS_QUERY =
  'query ($take: Int!, $skip: Int!) {\n  items: interviews(take: $take, skip: $skip) {\n    id\n    professionalName\n    status\n    deepProfile\n  }\n}'

export async function fetchInterviews(params: { take: number; skip: number }) {
  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      'apollo-require-preflight': 'true',
    },
    credentials: 'include',
    body: JSON.stringify({
      variables: {
        take: params.take,
        skip: params.skip,
      },
      query: INTERVIEWS_QUERY,
    }),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  const json = await res.json()
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }

  return json.data.items.map((item: { id: string; professionalName: string; status: string; deepProfile: unknown }) => ({
    id: item.id,
    candidate: item.professionalName,
    status: item.status,
    profile: item.deepProfile,
  }))
}
