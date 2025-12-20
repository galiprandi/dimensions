export default {
  async fetch(req) {
    const url = new URL(req.url)
    const origin = req.headers.get('origin') || ''
    const allowed = ['https://galiprandi.github.io', 'http://localhost:5173']
    const allowOrigin = allowed.includes(origin) ? origin : ''

    // 1) OPTIONS global
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowOrigin,
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Apollo-Require-Preflight',
        },
      })
    }

    // 2) Nueva ruta: /api/profile-summary?url=...
    if (url.pathname === '/api/profile-summary') {
      const target = url.searchParams.get('url') || ''
      if (!target) return json({ error: 'missing url' }, 400, allowOrigin)
      if (!target.startsWith('https://rooftop.dev/deep-profile/')) {
        return json({ error: 'domain not allowed', got: target }, 403, allowOrigin)
      }

      try {
        const upstream = await fetch(target, { redirect: 'follow' })
        if (!upstream.ok) {
          return json({ error: `upstream ${upstream.status}` }, upstream.status, allowOrigin)
        }
        const html = await upstream.text()
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        return json({ text }, 200, allowOrigin)
      } catch (e) {
        return json({ error: e.message || 'fetch error' }, 500, allowOrigin)
      }
    }

    // 3) Resto: proxy GraphQL
    const backend = 'https://backoffice.rooftop.dev/api/graphql'
    const cookie = req.headers.get('cookie') || ''
    const res = await fetch(backend, {
      method: 'POST',
      body: req.body,
      headers: {
        'content-type': 'application/json',
        'apollo-require-preflight': 'true',
        ...(cookie ? { cookie } : {}),
      },
      redirect: 'manual',
    })

    const responseHeaders = new Headers(res.headers)
    responseHeaders.set('Access-Control-Allow-Origin', allowOrigin)
    responseHeaders.set('Access-Control-Allow-Credentials', 'true')

    const setCookie = res.headers.get('set-cookie')
    if (setCookie) {
      const rewritten = setCookie
        .replace(/;\s*SameSite=[^;]+/i, '')
        .replace(/;\s*Secure/i, '') + '; SameSite=None; Secure'
      responseHeaders.delete('set-cookie')
      responseHeaders.append('set-cookie', rewritten)
    }

    return new Response(await res.arrayBuffer(), {
      status: res.status,
      headers: responseHeaders,
    })
  },
}

function json(body, status = 200, allowOrigin = '') {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      ...(allowOrigin ? { 'Access-Control-Allow-Origin': allowOrigin } : {}),
      ...(allowOrigin ? { 'Access-Control-Allow-Credentials': 'true' } : {}),
    },
  })
}
