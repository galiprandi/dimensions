import { useQuery } from '@tanstack/react-query'
import type { QueryObserverResult } from '@tanstack/react-query'

/**
 * Ejemplo de uso:
 * ```
 * const { data, refetch, isPending } = useAi<AiConclusionItem[]>({
 *   id: interviewId,
 *   getPrompt: () => buildJsonPrompt(nombre, dimensiones, stacks),
 *   parseResponse: (raw) => {
 *     const clean = stripMarkdownJson(raw)
 *     const parsed = JSON.parse(clean)
 *     return Array.isArray(parsed?.items) ? parsed.items : []
 *   }
 * })
 *
 * // Para disparar:
 * refetch()
 * ```
 */

export function useAi<TParsed>(options: UseAiOptions<TParsed>): UseAiResult<TParsed> {
  const { id, getPrompt, parseResponse, onDownloadProgress, languageModel } = options

  const lm =
    languageModel ||
    (globalThis as { LanguageModel?: LanguageModelFactory }).LanguageModel ||
    LanguageModel
  if (!lm) {
    throw new Error('LanguageModel no está disponible. Proporciona languageModel en las opciones.')
  }

  const query = useQuery<{ raw: string; parsed: TParsed; metrics: AiMetrics }, Error>({
    queryKey: ['AI', id],
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    queryFn: async () => {
      const expectedOutputs = [{ type: 'text' as const, languages: ['es'] }]
      const availability = await lm.availability({ expectedOutputs })
      if (availability === 'unavailable')
        throw new Error('La API de Prompt no es compatible con este dispositivo.')

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

      const prompt = getPrompt()
      const start = performance.now()
      const result = await session.prompt(prompt)
      const durationMs = Math.round(performance.now() - start)
      const parsed = parseResponse(result)

      return {
        raw: result,
        parsed,
        metrics: {
          durationMs,
          promptChars: prompt.length,
          responseChars: result.length,
          availability,
        },
      }
    },
  })

  return query
}

type UseAiOptions<TParsed> = {
  id: string
  getPrompt: () => string
  parseResponse: (raw: string) => TParsed
  onDownloadProgress?: (progress: number) => void
  languageModel?: LanguageModelFactory
}

type UseAiResult<TParsed> = QueryObserverResult<
  { raw: string; parsed: TParsed; prompt?: string; metrics: AiMetrics },
  Error
>

type ProgressEvent = { loaded: number }

type AiMetrics = {
  durationMs: number
  promptChars: number
  responseChars: number
  availability: Availability
}

type LanguageModelFactory = typeof LanguageModel
type Availability = Awaited<ReturnType<LanguageModelFactory['availability']>>
