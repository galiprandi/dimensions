import { useQuery } from '@tanstack/react-query'

type LanguageModelType = {
  availability(options?: { languages?: string[] }): Promise<'readily' | 'after-download' | 'no'>
  create(options?: {
    temperature?: number
    topK?: number
    signal?: AbortSignal
    monitor?: (m: { addEventListener(type: 'downloadprogress', listener: (e: { loaded: number }) => void): void }) => void
    initialPrompts?: Array<{
      role: 'system' | 'user' | 'assistant'
      content: string
    }>
    expectedOutputs?: Array<{
      type: 'text'
      languages: string[]
    }>
  }): Promise<{
    prompt(
      text:
        | string
        | Array<{
            role: string
            content: string | Array<{ type: string; value: unknown }>
          }>,
      options?: { responseConstraint?: unknown }
    ): Promise<string>
    destroy(): void
  }>
}

type ProfileInsight = {
  summary: string
  raw: string
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
  languageModel?: LanguageModelType
  onDownloadProgress?: (progress: number) => void
  proxyEndpoint?: string // e.g. '/api/profile-summary'
}

function buildPrompt(args: { profileText: string; profileUrl: string; roleLabel?: string; targetSeniority?: string }) {
  const { profileText, profileUrl, roleLabel, targetSeniority } = args
  const trimmed = profileText.slice(0, 12000) // evita prompts enormes
  return `
Eres un revisor técnico. A partir del perfil público extraído, redacta una reseña breve en español.
- Enfócate en stack, lenguajes, frameworks, años/tiempo de experiencia y seniority percibido.
- Si no hay datos, indica que la información es insuficiente.
- No inventes ni agregues datos no presentes.

Contexto:
- Rol objetivo: ${roleLabel || 'N/D'}
- Seniority objetivo: ${targetSeniority || 'N/D'}
- Fuente: ${profileUrl}
- Texto del perfil (recortado): """${trimmed}"""

Formato de salida (máx. 6 líneas):
1) Stack principal y lenguajes
2) Frameworks/tecnologías
3) Experiencia/tiempo (si aparece)
4) Seniority percibido (si aparece)
5) Señales destacadas
6) Riesgos o dudas
`.trim()
}

export function useProfileInsight(options: UseProfileInsightOptions) {
  const { id, profileUrl, roleLabel, targetSeniority, onDownloadProgress } = options
  const lm = options.languageModel || (globalThis as { LanguageModel?: LanguageModelType }).LanguageModel

  const query = useQuery<ProfileInsight, Error>({
    queryKey: ['profile-insight', id, profileUrl],
    enabled: false,
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: async () => {
      if (!profileUrl) throw new Error('No hay URL de perfil')
      if (!lm) throw new Error('LanguageModel no está disponible en este dispositivo.')

      // Intento vía proxy para evitar CORS; el backend debe permitir esta ruta.
      const endpoint = options.proxyEndpoint || '/api/profile-summary'
      const proxied = await fetch(`${endpoint}?url=${encodeURIComponent(profileUrl)}`, {
        method: 'GET',
        headers: { accept: 'application/json' },
      })

      if (!proxied.ok) {
        throw new Error(`No se pudo obtener el perfil (proxy) (${proxied.status})`)
      }

      const proxyJson = await proxied.json().catch(() => ({} as { text?: string; error?: string }))
      if (proxyJson.error) throw new Error(proxyJson.error)

      const profileText = typeof proxyJson.text === 'string' ? proxyJson.text : ''
      if (!profileText) throw new Error('El perfil no devolvió contenido utilizable.')

      const availability = await lm.availability({ languages: ['es'] })
      if (availability === 'no') throw new Error('La API de Prompt no es compatible con este dispositivo.')

      const expectedOutputs = [{ type: 'text' as const, languages: ['es'] }]
      const session =
        availability === 'readily'
          ? await lm.create({ expectedOutputs })
          : await lm.create({
              expectedOutputs,
              monitor(m) {
                m.addEventListener('downloadprogress', (e: { loaded: number }) => {
                  if (onDownloadProgress) onDownloadProgress(Math.round(e.loaded * 100))
                })
              },
            })

      const prompt = buildPrompt({ profileText, profileUrl, roleLabel, targetSeniority })
      const start = performance.now()
      const result = await session.prompt(prompt)
      const durationMs = Math.round(performance.now() - start)

      return {
        summary: result.trim(),
        raw: result,
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
