export async function loginBackofficeUser(params: { identity: string; secret: string }) {
  const identity = params.identity.trim()
  const secret = params.secret

  if (!identity || !secret) {
    return { ok: false as const, message: 'Falta identity o password.' }
  }

  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: {
      accept: '*/*',
      'content-type': 'application/json',
      'apollo-require-preflight': 'true',
    },
    credentials: 'include',
    body: JSON.stringify({
      variables: { identity, secret },
      query:
        'mutation ($identity: String!, $secret: String!) {\n  authenticate: authenticateBackofficeUserWithPassword(\n    email: $identity\n    password: $secret\n  ) {\n    ... on BackofficeUserAuthenticationWithPasswordSuccess {\n      item {\n        id\n        __typename\n      }\n      __typename\n    }\n    ... on BackofficeUserAuthenticationWithPasswordFailure {\n      message\n      __typename\n    }\n    __typename\n  }\n}',
    }),
  })

  if (!res.ok) {
    return { ok: false as const, message: `HTTP ${res.status}` }
  }

  let parsed: unknown
  try {
    parsed = await res.json()
  } catch {
    return { ok: false as const, message: 'Respuesta no es JSON válido.' }
  }

  const root = parsed as { data?: { authenticate?: unknown } } | null
  const auth = root?.data?.authenticate as { __typename?: unknown; message?: unknown } | null
  const typename = typeof auth?.__typename === 'string' ? auth.__typename : ''

  if (typename === 'BackofficeUserAuthenticationWithPasswordSuccess') {
    return { ok: true as const, message: 'OK' }
  }

  const msg = typeof auth?.message === 'string' ? auth.message : 'Login falló.'
  return { ok: false as const, message: msg }
}
