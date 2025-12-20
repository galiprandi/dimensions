import axios from 'axios'

const FALLBACK_PROD_API = 'https://backoffice.rooftop.dev/api/graphql'

function detectApiUrl() {
  const envUrl = normalizeEnvUrl(import.meta.env.VITE_API_URL)
  if (envUrl) return envUrl

  if (typeof window !== 'undefined') {
    const host = window.location.hostname || ''
    // GitHub Pages or any non-localhost host -> use absolute backend
    const isGithubPages = host.endsWith('github.io')
    const isLocalhost = host.includes('localhost') || host.startsWith('127.') || host === ''

    if (isGithubPages || !isLocalhost) return FALLBACK_PROD_API
  }

  // Local dev (proxied in Vite)
  return '/api/graphql'
}

function normalizeEnvUrl(raw?: string) {
  if (!raw) return ''
  const trimmed = raw.trim()
  if (!trimmed) return ''

  let candidate = trimmed
  if (candidate.startsWith('ttps://')) candidate = 'h' + candidate // fix missing leading h
  if (candidate.startsWith('//')) candidate = 'https:' + candidate
  if (!candidate.startsWith('http')) candidate = 'https://' + candidate

  try {
    // Validate URL; if invalid, fall back later
     
    const url = new URL(candidate)
    // Ensure path ends with /api/graphql
    if (!url.pathname || url.pathname === '/' || url.pathname === '') {
      url.pathname = '/api/graphql'
    }
    return url.toString()
  } catch {
    console.warn('[api] Invalid VITE_API_URL, falling back to defaults:', raw)
    return ''
  }
}

export const API_URL = detectApiUrl()

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    accept: '*/*',
    'content-type': 'application/json',
    'apollo-require-preflight': 'true',
  },
})
