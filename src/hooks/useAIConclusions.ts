import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { buildJsonPrompt, stripMarkdownJson } from '@/utils/ai'
import type { AiConclusionItem } from '@/types/ai'
import { PROFILE_ENDPOINT } from '@/lib/api'
import { useInterview } from './useInterview'
import { profileSummaryPrompt } from '../../prompts/ai-profile-summary'

const STEP_LABELS: readonly StepLabel[] = [
  { key: 'loading-interview', label: 'Cargando entrevista', activeOn: ['loading-interview'] },
  {
    key: 'checking-availability',
    label: 'Verificando disponibilidad de IA',
    activeOn: ['checking-availability'],
  },
  { key: 'fetching-profile', label: 'Obteniendo perfil público', activeOn: ['fetching-profile'] },
  {
    key: 'summarizing-profile',
    label: 'Resumiendo perfil con IA',
    activeOn: ['summarizing-profile'],
  },
  { key: 'generating-prompt', label: 'Generando prompt', activeOn: ['generating-prompt'] },
  {
    key: 'generating-conclusion',
    label: 'Generando conclusiones',
    activeOn: ['generating-conclusion'],
  },
  { key: 'ready', label: 'Conclusiones listas', activeOn: ['ready'] },
]

export const useAIConclusions = ({
  interviewId,
  enabled = true,
}: {
  interviewId?: string
  enabled?: boolean
}) => {
  const { data: interview, isLoading: interviewLoading } = useInterview(interviewId)
  const queryClient = useQueryClient()
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
  const [modelReady, setModelReady] = useState(false)
  const sessionRef = useRef<LanguageModelSession | null>(null)
  const sessionInterviewIdRef = useRef<string | undefined>(undefined)
  const resetSessionState = () => {
    setModelReady(false)
    setIsDownloading(false)
    setDownloadProgress(null)
  }

  const getOrCreateSession = async (expectedOutputs: { type: 'text'; languages: string[] }[]) => {
    const lm = (globalThis as { LanguageModel?: LanguageModelType }).LanguageModel
    if (!lm) throw new Error('LanguageModel no está disponible.')

    const sameInterview = sessionInterviewIdRef.current === interviewId
    if (sessionRef.current && sameInterview) return sessionRef.current

    sessionInterviewIdRef.current = interviewId
    sessionRef.current = null
    resetSessionState()

    const session = await lm.create({
      expectedOutputs,
      monitor: (m) =>
        m.addEventListener('downloadprogress', (e: { loaded: number }) => {
          if (!modelReady) {
            setIsDownloading(true)
            setDownloadProgress(e.loaded)
          }
        }),
    })
    sessionRef.current = session
    return session
  }

  const availabilityQuery = useQuery({
    queryKey: ['AI', 'availability'],
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: async () => {
      const lm = (globalThis as { LanguageModel?: LanguageModelType }).LanguageModel
      if (!lm) return false
      try {
        const availability = await lm.availability({ languages: ['es'] })
        return availability !== 'no'
      } catch {
        return false
      }
    },
  })

  const profileSourceQuery = useQuery<string, Error>({
    queryKey: ['AI', 'profile-source', interviewId, interview?.profileUrl],
    enabled: enabled && Boolean(interview?.profileUrl) && Boolean(availabilityQuery.data),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    queryFn: async () => {
      if (!interview?.profileUrl) throw new Error('No hay URL de perfil')
      const proxied = await fetch(
        `${PROFILE_ENDPOINT}?url=${encodeURIComponent(interview.profileUrl)}`,
        {
          method: 'GET',
          headers: { accept: 'application/json' },
        }
      )
      if (!proxied.ok) {
        throw new Error(`No se pudo obtener el perfil (proxy) (${proxied.status})`)
      }
      const proxyJson = await proxied.json().catch(() => ({}) as { text?: string; error?: string })
      if (proxyJson.error) throw new Error(proxyJson.error)
      const profileText = typeof proxyJson.text === 'string' ? proxyJson.text : ''
      if (!profileText) throw new Error('El perfil no devolvió contenido utilizable.')
      return profileText
    },
  })

  const profileSummaryQuery = useQuery<string, Error>({
    queryKey: ['AI', 'profile-summary', interviewId, interview?.profileUrl],
    enabled: enabled && Boolean(profileSourceQuery.data) && Boolean(availabilityQuery.data),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: false,
    queryFn: async () => {
      const lm = (globalThis as { LanguageModel?: LanguageModelType }).LanguageModel
      if (!lm) throw new Error('LanguageModel no está disponible.')
      const availability = await lm.availability({ languages: ['es'] })
      if (availability === 'no')
        throw new Error('La API de Prompt no es compatible con este dispositivo.')
      const expectedOutputs = [{ type: 'text' as const, languages: ['es'] }]
      const session = await getOrCreateSession(expectedOutputs)

      const prompt = profileSummaryPrompt
        .replace('{{profileUrl}}', interview?.profileUrl || 'N/D')
        .replace('{{profileText}}', profileSourceQuery.data?.slice(0, 12000) || '')

      try {
        const result = await session.prompt(prompt)
        setModelReady(true)
        return result.trim()
      } finally {
        setIsDownloading(false)
      }
    },
  })

  const prompt = useMemo(() => {
    if (!interview || !profileSummaryQuery.data) return ''
    return buildJsonPrompt(
      interview.candidate,
      interview.dimensions,
      interview.stack,
      profileSummaryQuery.data,
      interview.conclusion
    )
  }, [interview, profileSummaryQuery.data])

  const conclusionsQuery = useQuery<AiConclusionsResult, Error>({
    queryKey: ['AI', 'conclusions', interviewId],
    enabled: enabled && Boolean(prompt) && Boolean(availabilityQuery.data),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    queryFn: async () => {
      try {
        const lm = (globalThis as { LanguageModel?: LanguageModelType }).LanguageModel
        if (!lm) throw new Error('LanguageModel no está disponible.')
        const availability = await lm.availability({ languages: ['es'] })
        if (availability === 'no')
          throw new Error('La API de Prompt no es compatible con este dispositivo.')
        const expectedOutputs = [{ type: 'text' as const, languages: ['es'] }]
        const session = await getOrCreateSession(expectedOutputs)

        const rawResult = await session.prompt(prompt)
        setModelReady(true)
        const clean = stripMarkdownJson(rawResult)

        let parsed: AiConclusionItem[] = []
        let json: Record<string, unknown> = {}
        try {
          json = JSON.parse(clean)
          parsed = Array.isArray(json?.items) ? (json.items as AiConclusionItem[]) : []
        } catch {
          parsed = []
        }

        const finalConclusion =
          typeof json?.finalConclusion === 'string' ? json.finalConclusion.trim() : ''

        return {
          raw: rawResult,
          parsed,
          prompt,
          finalConclusion,
        }
      } catch (error) {
        setModelReady(false)
        throw error
      } finally {
        setIsDownloading(false)
      }
    },
  })

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      sessionRef.current?.destroy?.()
      sessionRef.current = null
    }
  }, [])

  const parsedItems: NormalizedConclusionItem[] = useMemo(() => {
    const parsed = conclusionsQuery.data?.parsed
    if (!parsed || !interview) return []
    return parsed.map((item, idx) => {
      const stackEval = item.isStack
        ? interview.stack.find((stack) => stack.stackId === item.dimensionId)
        : undefined
      const dimensionEval = !item.isStack
        ? interview.dimensions.find(
            (dimension) =>
              dimension.dimensionId === item.dimensionId || dimension.id === item.dimensionId
          )
        : undefined
      const effectiveId =
        stackEval?.id ||
        dimensionEval?.id ||
        item.dimensionId ||
        item.evaluationId ||
        (item.isStack ? `stack-${idx}` : `dim-${idx}`)

      return {
        id: effectiveId,
        evaluationId: effectiveId,
        label:
          item.label ||
          stackEval?.label ||
          dimensionEval?.label.split(' (')[0] ||
          (item.isStack ? 'Main Stack' : 'Dimension'),
        conclusion: item.conclusion || '',
        dimensionId: item.isStack
          ? undefined
          : item.dimensionId || dimensionEval?.dimensionId || '',
        stackId: item.isStack ? item.dimensionId || stackEval?.stackId || '' : undefined,
        type: item.isStack ? 'stack' : 'dimension',
        topics: item.isStack ? (stackEval?.topics ?? []) : (dimensionEval?.topics ?? []),
        currentConclusion: item.isStack ? stackEval?.conclusion : dimensionEval?.conclusion,
      }
    })
  }, [conclusionsQuery.data?.parsed, interview])

  const finalItem: NormalizedConclusionItem = {
    id: interviewId!,
    evaluationId: interviewId!,
    label: 'Conclusión Final',
    conclusion: conclusionsQuery.data?.finalConclusion || '',
    type: 'conclusion',
    topics: [],
  }

  const items = [...parsedItems, finalItem]

  const status: StepStatus = useMemo(() => {
    if (interviewLoading) return 'loading-interview'
    if (availabilityQuery.isLoading) return 'checking-availability'
    if (profileSourceQuery.isLoading) return 'fetching-profile'
    if (profileSummaryQuery.isLoading) return 'summarizing-profile'
    if (prompt && (conclusionsQuery.isLoading || conclusionsQuery.isFetching))
      return 'generating-conclusion'
    if (conclusionsQuery.data) return 'ready'
    if (prompt) return 'generating-prompt'
    return 'pending'
  }, [
    interviewLoading,
    availabilityQuery.isLoading,
    profileSourceQuery.isLoading,
    profileSummaryQuery.isLoading,
    prompt,
    conclusionsQuery.isLoading,
    conclusionsQuery.isFetching,
    conclusionsQuery.data,
  ])

  const generate = async () => {
    await Promise.allSettled([
      queryClient.removeQueries({ queryKey: ['AI', 'conclusions', interviewId] }),
      queryClient.removeQueries({
        queryKey: ['AI', 'profile-summary', interviewId, interview?.profileUrl],
      }),
      queryClient.removeQueries({
        queryKey: ['AI', 'profile-source', interviewId, interview?.profileUrl],
      }),
    ])
    // Dispara nuevamente el ciclo de generación
    await conclusionsQuery.refetch()
  }

  const isGenerating = status !== 'ready'

  console.log({ prompt, items })
  return {
    isAiAvailable: Boolean(availabilityQuery.data),
    profileSource: profileSourceQuery.data,
    profileSummary: profileSummaryQuery.data,
    isLoading: profileSummaryQuery.isLoading,
    prompt,
    data: conclusionsQuery.data,
    items,
    status,
    generate,
    isGenerating,
    isDownloading,
    downloadProgress,
    STEP_LABELS,
    finalConclusion: conclusionsQuery.data?.finalConclusion || '',
  }
}

export type AiConclusionsResult = {
  raw: string
  parsed: AiConclusionItem[]
  prompt: string
  finalConclusion: string
}

export type NormalizedConclusionItem = {
  id: string
  evaluationId: string
  label: string
  conclusion: string
  dimensionId?: string
  stackId?: string
  type: 'dimension' | 'stack' | 'conclusion'
  topics: string[]
  currentConclusion?: string
}

type LanguageModelType = {
  availability(options?: { languages?: string[] }): Promise<'readily' | 'after-download' | 'no'>
  create(options?: {
    temperature?: number
    topK?: number
    signal?: AbortSignal
    monitor?: (m: {
      addEventListener(type: 'downloadprogress', listener: (e: { loaded: number }) => void): void
    }) => void
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

type StepStatus =
  | 'pending'
  | 'loading-interview'
  | 'checking-availability'
  | 'fetching-profile'
  | 'summarizing-profile'
  | 'generating-prompt'
  | 'generating-conclusion'
  | 'ready'
type LanguageModelSession = Awaited<ReturnType<LanguageModelType['create']>>
type StepLabel = { key: string; label: string; activeOn: readonly string[] }
