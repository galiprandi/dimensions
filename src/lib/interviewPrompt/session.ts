export function normalizeKeystoneSession(rawInput: string) {
  const raw = rawInput.trim()
  if (!raw) return ''

  const fe26Match = raw.match(/Fe26\.[^\s;]+/)
  if (fe26Match && fe26Match[0]) return fe26Match[0]

  const pairMatch = raw.match(/keystonejs-session=([^;\s]+)/)
  if (pairMatch && pairMatch[1]) return pairMatch[1]

  return raw
}

export function applySessionCookieToDocument(rawCookieInput: string) {
  const cookieValue = rawCookieInput.trim()
  if (!cookieValue) return

  const token = normalizeKeystoneSession(cookieValue)
  if (!token) return

  const safeToken = token.replace(/;/g, '')
  document.cookie = `keystonejs-session=${safeToken}; path=/; SameSite=Lax`
}
