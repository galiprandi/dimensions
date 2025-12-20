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

  const lm = languageModel || (globalThis as { LanguageModel?: LanguageModelType }).LanguageModel
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
      const availability = await lm.availability({ languages: ['es'] })
      if (availability === 'no') throw new Error('La API de Prompt no es compatible con este dispositivo.')

      const expectedOutputs = [{ type: 'text' as const, languages: ['es'] }]
      let session
      if (availability === 'readily') {
        session = await lm.create({ expectedOutputs })
      } else {
        session = await lm.create({
          expectedOutputs,
          monitor(m: { addEventListener(type: 'downloadprogress', listener: (e: ProgressEvent) => void): void }) {
            m.addEventListener('downloadprogress', (e: ProgressEvent) => {
              if (onDownloadProgress) onDownloadProgress(Math.round(e.loaded * 100))
            })
          }
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
  languageModel?: LanguageModelType
}

type UseAiResult<TParsed> = QueryObserverResult<{ raw: string; parsed: TParsed; prompt?: string; metrics: AiMetrics }, Error>

type ProgressEvent = { loaded: number }

type AiMetrics = {
  durationMs: number
  promptChars: number
  responseChars: number
  availability: 'readily' | 'after-download'
}

type LanguageModelType = {
  availability(options?: { languages?: string[] }): Promise<'readily' | 'after-download' | 'no'>
  create(options?: {
    temperature?: number
    topK?: number
    signal?: AbortSignal
    monitor?: (m: { addEventListener(type: 'downloadprogress', listener: (e: ProgressEvent) => void): void }) => void
    initialPrompts?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
    expectedOutputs?: Array<{ type: 'text'; languages: string[] }>
  }): Promise<{
    prompt(text: string | Array<{ role: string; content: string | Array<{ type: string; value: unknown }> }>, options?: { responseConstraint?: unknown }): Promise<string>
    append(messages: Array<{ role: string; content: string | Array<{ type: string; value: string | Array<{ type: string; value: unknown }> }> }>): Promise<void>
    destroy(): void
  }>
  params(): Promise<{ defaultTopK: number; maxTopK: number; defaultTemperature: number; maxTemperature: number }>
}

// Type declaration for Chrome's experimental AI API
declare global {
  const LanguageModel: {
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
      prompt(text: string | Array<{ role: string; content: string | Array<{ type: string; value: unknown }> }>, options?: { responseConstraint?: unknown }): Promise<string>
      append(messages: Array<{ role: string; content: string | Array<{ type: string; value: unknown }> }>): Promise<void>
      destroy(): void
    }>
    params(): Promise<{ defaultTopK: number; maxTopK: number; defaultTemperature: number; maxTemperature: number }>
  }
}