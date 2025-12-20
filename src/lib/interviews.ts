import { apiClient } from './api'

export type InterviewListItem = {
  id: string
  professionalName: string
  status: string
  complete: boolean
  deepProfile: boolean
}


const INTERVIEWS_QUERY =
  'query ($take: Int!, $skip: Int!) {\n  items: interviews(take: $take, skip: $skip) {\n    id\n    professionalName\n    status\n    deepProfile\n    professional {\n      photoURL\n      seniority\n    }\n  }\n}'

export async function fetchInterviews(params: { take: number; skip: number }) {
  const res = await apiClient.post('', {
    variables: {
      take: params.take,
      skip: params.skip,
    },
    query: INTERVIEWS_QUERY,
  })

  const json = res.data
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }

  return json.data.items.map((item: { id: string; professionalName: string; status: string; deepProfile: unknown; professional: { photoURL: string; seniority: string } }) => ({
    id: item.id,
    candidate: item.professionalName,
    status: item.status,
    profile: item.deepProfile,
    photoURL: item.professional?.photoURL || '',
    seniority: item.professional?.seniority || '',
  }))
}
