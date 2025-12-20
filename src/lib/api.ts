import axios from 'axios'

const FALLBACK_PROD_API = 'https://backoffice.rooftop.dev/api/graphql'

function detectApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL
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
