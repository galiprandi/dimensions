import { useQuery } from '@tanstack/react-query'
import { PROFILE_ENDPOINT } from '@/lib/api'

type ProfileInsight = {
  summary: string
  raw: string
  prompt: string
  metrics: {
    durationMs: number
    promptChars: number
    responseChars: number
  }
}

type UseProfileInsightOptions = {
  id: string
  profileUrl?: string
  roleLabel?: string
  targetSeniority?: string
  languageModel?: LanguageModelFactory
  onDownloadProgress?: (progress: number) => void
  proxyEndpoint?: string // e.g. '/api/profile-summary'
  enabled?: boolean
}

export function useProfileInsight(options: UseProfileInsightOptions) {
  const { id, profileUrl, roleLabel, targetSeniority, onDownloadProgress, enabled } = options
  const lm =
    options.languageModel ||
    (globalThis as { LanguageModel?: LanguageModelFactory }).LanguageModel ||
    LanguageModel

  const query = useQuery<ProfileInsight, Error>({
    queryKey: ['AI', 'profile-insight', id, profileUrl],
    enabled: enabled ?? false,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    queryFn: async () => {
      if (!profileUrl) throw new Error('No hay URL de perfil')
      if (!lm) throw new Error('LanguageModel no está disponible en este dispositivo.')

      const endpoint = PROFILE_ENDPOINT || '/api/profile-summary'
      const proxied = await fetch(`${endpoint}?url=${encodeURIComponent(profileUrl)}`, {
        method: 'GET',
        headers: { accept: 'application/json' },
      })

      if (!proxied.ok) {
        throw new Error(`No se pudo obtener el perfil (proxy) (${proxied.status})`)
      }

      const proxyJson = await proxied.json().catch(() => ({}) as { text?: string; error?: string })
      if (proxyJson.error) throw new Error(proxyJson.error)

      const profileText = typeof proxyJson.text === 'string' ? proxyJson.text : ''
      if (!profileText) throw new Error('El perfil no devolvió contenido utilizable.')

      const availability = await lm.availability({
        expectedOutputs: [{ type: 'text', languages: ['es'] }],
      })
      if (availability === 'unavailable')
        throw new Error('La API de Prompt no es compatible con este dispositivo.')

      const expectedOutputs = [{ type: 'text' as const, languages: ['es'] }]
      let session
      if (availability === 'available') {
        session = await lm.create({ expectedOutputs })
      } else {
        session = await lm.create({
          expectedOutputs,
          monitor(m: {
            addEventListener(type: 'downloadprogress', listener: (e: ProgressEvent) => void): void
          }) {
            m.addEventListener('downloadprogress', (e: ProgressEvent) => {
              if (onDownloadProgress) onDownloadProgress(Math.round(e.loaded * 100))
            })
          },
        })
      }

      const prompt = `
Eres un revisor técnico. A partir del perfil público extraído, redacta una reseña breve en español.
- Enfócate en stack, lenguajes, frameworks, años/tiempo de experiencia y seniority percibido.
- Si no hay datos, indica que la información es insuficiente.
- No inventes ni agregues datos no presentes.

Contexto:
- Rol objetivo: ${roleLabel || 'N/D'}
- Seniority objetivo: ${targetSeniority || 'N/D'}
- Fuente: ${profileUrl}
- Texto del perfil (recortado): """${profileText.slice(0, 12000)}"""

Formato de salida (máx. 6 líneas):
1) Stack principal y lenguajes
2) Frameworks/tecnologías
3) Experiencia/tiempo (si aparece)
4) Seniority percibido (si aparece)
5) Señales destacadas
6) Riesgos o dudas
`.trim()
      const start = performance.now()
      const result = await session.prompt(prompt)
      const durationMs = Math.round(performance.now() - start)

      return {
        summary: result.trim(),
        raw: result,
        prompt,
        metrics: {
          durationMs,
          promptChars: prompt.length,
          responseChars: result.length,
        },
      }
    },
  })

  return query
}

type ProgressEvent = { loaded: number }
type LanguageModelFactory = typeof LanguageModel
