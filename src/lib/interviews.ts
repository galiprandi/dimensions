export type InterviewListItem = {
  id: string
  professionalName: string
  status: string
  complete: boolean
  deepProfile: boolean
}

type InterviewListResponse = {
  data?: {
    items?: Array<{
      id?: unknown
      professionalName?: unknown
      status?: unknown
      complete?: unknown
      deepProfile?: unknown
    }>
    count?: unknown
  }
  errors?: Array<{ message?: unknown }>
}

const INTERVIEWS_QUERY =
  'query ($where: InterviewWhereInput, $take: Int!, $skip: Int!, $orderBy: [InterviewOrderByInput!]) {\n  items: interviews(where: $where, take: $take, skip: $skip, orderBy: $orderBy) {\n    id\n    professionalName\n    status\n    complete\n    deepProfile\n    __typename\n  }\n  count: interviewsCount(where: $where)\n}'

export async function fetchInterviews(params: { search: string; take: number; skip: number }) {
  const where = params.search.trim() ? buildWhere(params.search) : { OR: [] }

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
        where,
        take: params.take,
        skip: params.skip,
        orderBy: [{ status: 'asc' }],
      },
      query: INTERVIEWS_QUERY,
    }),
  })

  if (!res.ok) {
    return { ok: false as const, message: `HTTP ${res.status}`, items: [] as InterviewListItem[], count: 0 }
  }

  let parsed: unknown
  try {
    parsed = await res.json()
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return { ok: false as const, message, items: [] as InterviewListItem[], count: 0 }
  }

  const payload = parsed as InterviewListResponse
  if (payload?.errors && payload.errors.length > 0) {
    const first = payload.errors[0]
    const msg = typeof first?.message === 'string' ? first.message : 'Error desconocido.'
    return { ok: false as const, message: msg, items: [] as InterviewListItem[], count: 0 }
  }

  const rawItems = payload?.data?.items
  const items: InterviewListItem[] = []

  if (Array.isArray(rawItems)) {
    for (const it of rawItems) {
      const id = typeof it?.id === 'string' ? it.id.trim() : ''
      if (!id) continue

      items.push({
        id,
        professionalName: typeof it?.professionalName === 'string' ? it.professionalName : '',
        status: typeof it?.status === 'string' ? it.status : '',
        complete: Boolean(it?.complete),
        deepProfile: Boolean(it?.deepProfile),
      })
    }
  }

  const count = typeof payload?.data?.count === 'number' ? payload.data.count : Number(payload?.data?.count || 0)
  return { ok: true as const, message: '', items, count: Number.isFinite(count) ? count : 0 }
}

function buildWhere(search: string) {
  const q = search.trim()
  if (!q) return { OR: [] as unknown[] }

  // Heurística segura: filtra por nombre del profesional; si el usuario pega un UUID, también buscamos por id
  const looksLikeId = /^[0-9a-fA-F-]{16,}$/.test(q)

  const OR: unknown[] = [{ professionalName: { contains: q, mode: 'insensitive' } }]
  if (looksLikeId) OR.push({ id: { equals: q } })

  return { OR }
}
