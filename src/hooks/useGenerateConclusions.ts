import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { buildJsonPrompt } from '@/utils/ai'
import type { DimensionItem, StackItem } from '@/utils/ai'
import type { AiConclusionItem } from '@/types/ai'

type UseGenerateConclusionsOptions = {
  id: string
  interviewName: string
  dimensions: DimensionItem[]
  stack: StackItem[]
  profileUrl?: string
  enableProfile: boolean
}

type UseGenerateConclusionsResult = {
  data?: {
    raw: string
    parsed: AiConclusionItem[]
    prompt: string
    metrics: {
      durationMs: number
      promptChars: number
      responseChars: number
      availability: 'readily' | 'after-download'
    }
  }
  isLoading: boolean
  error?: Error
  steps: { text: string; status: 'pending' | 'in-progress' | 'completed' }[]
  refetch: () => Promise<UseGenerateConclusionsResult['data']>
}

export function useGenerateConclusions(options: UseGenerateConclusionsOptions): UseGenerateConclusionsResult {
  const { id, interviewName, dimensions, stack, profileUrl, enableProfile } = options
  const queryClient = useQueryClient()
  const [steps, setSteps] = useState<{ text: string; status: 'pending' | 'in-progress' | 'completed' }[]>([
    { text: 'Obteniendo el perfil del candidato', status: 'pending' },
    { text: `Analizando el perfil de ${interviewName}`, status: 'pending' },
    { text: 'Generando conclusiones por dimensión', status: 'pending' },
  ])

  const query = useQuery({
    queryKey: ['AI', 'conclusions', id],
    enabled: true,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    queryFn: async () => {

      setSteps([
        { text: 'Obteniendo el perfil del candidato', status: 'pending' },
        { text: `Analizando el perfil de ${interviewName}`, status: 'pending' },
        { text: 'Generando conclusiones por dimensión', status: 'pending' },
      ])

      try {
        let profileSummary: string | undefined
        if (enableProfile && profileUrl) {
          setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'in-progress' } : s))
          const profileData = await queryClient.fetchQuery({
            queryKey: ['profile-insight', id, profileUrl],
            queryFn: async () => {
              const lm = (globalThis as any).LanguageModel
              if (!lm) throw new Error('LanguageModel no está disponible.')

              const endpoint = '/api/profile-summary'
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
              let session
              if (availability === 'readily') {
                session = await lm.create({ expectedOutputs })
              } else {
                session = await lm.create({
                  expectedOutputs,
                  monitor() {
                    // unused
                  },
                })
              }

              const prompt = `
Eres un revisor técnico. A partir del perfil público extraído, redacta una reseña breve en español.
- Enfócate en stack, lenguajes, frameworks, años/tiempo de experiencia y seniority percibido.
- Si no hay datos, indica que la información es insuficiente.
- No inventes ni agregues datos no presentes.

Contexto:
- Rol objetivo: Frontend/Full Stack
- Seniority objetivo: Senior
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
            staleTime: Infinity,
            gcTime: Infinity,
          })
          if (profileData) {
            profileSummary = profileData.summary
          }
          setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'completed' } : i === 1 ? { ...s, status: 'in-progress' } : s))
          // Simulate analysis time
          await new Promise(resolve => setTimeout(resolve, 500))
          setSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'completed' } : i === 2 ? { ...s, status: 'in-progress' } : s))
        } else {
          setSteps(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'in-progress' } : s))
        }

        const lm = (globalThis as any).LanguageModel
        if (!lm) throw new Error('LanguageModel no está disponible.')

        const availability = await lm.availability({ languages: ['es'] })
        if (availability === 'no') throw new Error('La API de Prompt no es compatible con este dispositivo.')

        const expectedOutputs = [{ type: 'text' as const, languages: ['es'] }]
        let session
        if (availability === 'readily') {
          session = await lm.create({ expectedOutputs })
        } else {
          session = await lm.create({
            expectedOutputs,
            monitor() {
              // unused
            },
          })
        }

        const prompt = buildJsonPrompt(interviewName, dimensions, stack, profileSummary)
        const start = performance.now()
        const rawResult = await session.prompt(prompt)
        const durationMs = Math.round(performance.now() - start)

        // Simple parse for AiConclusionItem
        const clean = rawResult.trim()
        let parsed: AiConclusionItem[] = []
        try {
          if (clean.startsWith('```')) {
            const withoutFence = clean.replace(/^```[a-zA-Z]*\s*/, '').replace(/```$/, '')
            const json = JSON.parse(withoutFence)
            parsed = Array.isArray(json?.items) ? json.items : []
          } else {
            const json = JSON.parse(clean)
            parsed = Array.isArray(json?.items) ? json.items : []
          }
        } catch {
          // If parsing fails, leave parsed empty
        }

        const data = {
          raw: rawResult,
          parsed,
          prompt,
          metrics: {
            durationMs,
            promptChars: prompt.length,
            responseChars: rawResult.length,
            availability,
          },
        }

        queryClient.setQueryData(['AI', 'conclusions', id], data)
        setSteps(prev => prev.map(s => ({ ...s, status: 'completed' })))
        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })))
        throw error
      }
    },
  })

  const refetch = async () => {
    setSteps([
      { text: 'Obteniendo el perfil del candidato', status: 'pending' },
      { text: `Analizando el perfil de ${interviewName}`, status: 'pending' },
      { text: 'Generando conclusiones por dimensión', status: 'pending' },
    ])

    try {
      let profileSummary: string | undefined
      if (enableProfile && profileUrl) {
        setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'in-progress' } : s))
        const profileData = await queryClient.fetchQuery({
          queryKey: ['profile-insight', id, profileUrl],
          queryFn: async () => {
            const lm = (globalThis as any).LanguageModel
            if (!lm) throw new Error('LanguageModel no está disponible.')

            const endpoint = '/api/profile-summary'
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
            let session
            if (availability === 'readily') {
              session = await lm.create({ expectedOutputs })
            } else {
              session = await lm.create({
                expectedOutputs,
                monitor() {
                  // unused
                },
              })
            }

            const prompt = `
Eres un revisor técnico. A partir del perfil público extraído, redacta una reseña breve en español.
- Enfócate en stack, lenguajes, frameworks, años/tiempo de experiencia y seniority percibido.
- Si no hay datos, indica que la información es insuficiente.
- No inventes ni agregues datos no presentes.

Contexto:
- Rol objetivo: Frontend/Full Stack
- Seniority objetivo: Senior
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
          staleTime: Infinity,
          gcTime: Infinity,
        })
        if (profileData) {
          profileSummary = profileData.summary
        }
        setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'completed' } : i === 1 ? { ...s, status: 'in-progress' } : s))
        // Simulate analysis time
        await new Promise(resolve => setTimeout(resolve, 500))
        setSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'completed' } : i === 2 ? { ...s, status: 'in-progress' } : s))
      } else {
        setSteps(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'in-progress' } : s))
      }

      const lm = (globalThis as any).LanguageModel
      if (!lm) throw new Error('LanguageModel no está disponible.')

      const availability = await lm.availability({ languages: ['es'] })
      if (availability === 'no') throw new Error('La API de Prompt no es compatible con este dispositivo.')

      const expectedOutputs = [{ type: 'text' as const, languages: ['es'] }]
      let session
      if (availability === 'readily') {
        session = await lm.create({ expectedOutputs })
      } else {
        session = await lm.create({
          expectedOutputs,
          monitor() {
            // unused
          },
        })
      }

      const prompt = buildJsonPrompt(interviewName, dimensions, stack, profileSummary)
      const start = performance.now()
      const rawResult = await session.prompt(prompt)
      const durationMs = Math.round(performance.now() - start)

      // Simple parse for AiConclusionItem
      const clean = rawResult.trim()
      let parsed: AiConclusionItem[] = []
      try {
        if (clean.startsWith('```')) {
          const withoutFence = clean.replace(/^```[a-zA-Z]*\s*/, '').replace(/```$/, '')
          const json = JSON.parse(withoutFence)
          parsed = Array.isArray(json?.items) ? json.items : []
        } else {
          const json = JSON.parse(clean)
          parsed = Array.isArray(json?.items) ? json.items : []
        }
      } catch {
        // If parsing fails, leave parsed empty
      }

      const data = {
        raw: rawResult,
        parsed,
        prompt,
        metrics: {
          durationMs,
          promptChars: prompt.length,
          responseChars: rawResult.length,
          availability,
        },
      }

      queryClient.setQueryData(['conclusions', id], data)
      setSteps(prev => prev.map(s => ({ ...s, status: 'completed' })))
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setSteps(prev => prev.map(s => ({ ...s, status: 'pending' })))
      throw error
    }
  }

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    steps,
    refetch,
  }
}
