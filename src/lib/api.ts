import axios from 'axios'

const FALLBACK_PROD_API = 'https://backoffice.rooftop.dev/api/graphql'

function detectApiUrl() {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL

  // On GitHub Pages we are served from https://<user>.github.io/<repo>, so use the absolute API.
  const host = typeof window !== 'undefined' ? window.location.hostname : ''
  const isGithubPages = host.endsWith('github.io')

  if (isGithubPages) return FALLBACK_PROD_API

  // Local dev (proxied in Vite).
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
