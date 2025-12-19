import systemPromptGuide from '../../../prompts/system-prompt-guide.md?raw'
import { filterAndNumberQuestionLines, numberQuestionLines } from './questions'
import type { GraphQLInterviewResponse } from './types'

export function buildPromptFromResponse(parsed: unknown) {
  const payload = parsed as GraphQLInterviewResponse

  if (payload?.errors && Array.isArray(payload.errors) && payload.errors.length > 0) {
    const first = payload.errors[0]
    const msg = typeof first?.message === 'string' ? first.message : 'Error desconocido de GraphQL.'
    return { ok: false as const, text: msg }
  }

  const dimensionEvaluations = payload?.data?.interview?.dimensionEvaluations
  const dimensions = payload?.data?.dimensions
  const subdimensionsToEvaluate = payload?.data?.interview?.subdimensionsToEvaluate
  const topicsToEvaluate = payload?.data?.interview?.topicsToEvaluate
  const mainStackEvaluations = payload?.data?.interview?.mainStackEvaluations
  const mainStacks = payload?.data?.mainStacks

  const candidateNameRaw = payload?.data?.interview?.professional?.fullName
  const candidateName = typeof candidateNameRaw === 'string' ? candidateNameRaw.trim() : ''

  const interviewConclusionRaw = payload?.data?.interview?.conclusion
  const interviewConclusion = typeof interviewConclusionRaw === 'string' ? interviewConclusionRaw.trim() : ''

  const dimensionIdToExistingNotes = new Map<string, string>()
  if (Array.isArray(dimensionEvaluations)) {
    for (const e of dimensionEvaluations) {
      const rawId = e?.dimension?.id
      const dimId = typeof rawId === 'string' ? rawId.trim() : ''
      const rawConclusion = e?.conclusion
      const notes = typeof rawConclusion === 'string' ? rawConclusion.trim() : ''
      if (dimId && notes) dimensionIdToExistingNotes.set(dimId, notes)
    }
  }

  const mainStackIdToTopicIds = new Map<string, Set<string>>()
  if (Array.isArray(topicsToEvaluate)) {
    for (const t of topicsToEvaluate) {
      const topicIdRaw = t?.topic?.id
      const stackIdRaw = t?.topic?.mainStack?.id
      const topicId = typeof topicIdRaw === 'string' ? topicIdRaw.trim() : ''
      const stackId = typeof stackIdRaw === 'string' ? stackIdRaw.trim() : ''
      if (!topicId || !stackId) continue

      const set = mainStackIdToTopicIds.get(stackId) || new Set<string>()
      set.add(topicId)
      mainStackIdToTopicIds.set(stackId, set)
    }
  }

  const mainStackIdToName = new Map<string, string>()
  if (Array.isArray(mainStacks)) {
    for (const s of mainStacks) {
      const id = typeof s?.id === 'string' ? s.id.trim() : ''
      const name = typeof s?.name === 'string' ? s.name.trim() : ''
      if (id && name) mainStackIdToName.set(id, name)
    }
  }

  const idToDimension = new Map<string, { name: string; questionsBlock: string }>()
  if (Array.isArray(dimensions)) {
    for (const d of dimensions) {
      const id = typeof d?.id === 'string' ? d.id.trim() : ''
      const name = typeof d?.name === 'string' ? d.name.trim() : ''
      if (!id || !name) continue

      const questionsParts: string[] = []
      const subs = d?.subdimensions
      if (Array.isArray(subs)) {
        for (const s of subs) {
          const subName = typeof s?.name === 'string' ? s.name.trim() : ''
          const q = typeof s?.questions === 'string' ? s.questions.trim() : ''
          if (!q) continue
          const numbered = numberQuestionLines(q)
          if (subName) {
            questionsParts.push(`## ${subName}\n\n${numbered}`)
          } else {
            questionsParts.push(numbered)
          }
        }
      }

      const questionsText = questionsParts.length > 0 ? questionsParts.join('\n\n') : ''
      const questionsBlock = questionsText ? `<!--\nPreguntas (guía):\n\n${questionsText}\n-->` : ''
      idToDimension.set(id, { name, questionsBlock })
    }
  }

  const evaluatedDimensionIds = new Set<string>()
  if (Array.isArray(dimensionEvaluations)) {
    for (const item of dimensionEvaluations) {
      const dimensionId = item?.dimension?.id
      const dimId = typeof dimensionId === 'string' ? dimensionId.trim() : ''
      if (dimId) evaluatedDimensionIds.add(dimId)
    }
  }

  const dimensionOrderFromInterview: string[] = []
  const seenInterview = new Set<string>()
  if (Array.isArray(subdimensionsToEvaluate)) {
    for (const e of subdimensionsToEvaluate) {
      const rawId = e?.subdimension?.dimension?.id
      const id = typeof rawId === 'string' ? rawId.trim() : ''
      if (!id || seenInterview.has(id)) continue
      seenInterview.add(id)
      dimensionOrderFromInterview.push(id)
    }
  }

  const orderedEvaluatedDimensionIds: string[] = []
  const alreadyAdded = new Set<string>()
  for (const id of dimensionOrderFromInterview) {
    if (evaluatedDimensionIds.has(id) && !alreadyAdded.has(id)) {
      alreadyAdded.add(id)
      orderedEvaluatedDimensionIds.push(id)
    }
  }

  if (Array.isArray(dimensions)) {
    for (const d of dimensions) {
      const id = typeof d?.id === 'string' ? d.id.trim() : ''
      if (id && evaluatedDimensionIds.has(id) && !alreadyAdded.has(id)) {
        alreadyAdded.add(id)
        orderedEvaluatedDimensionIds.push(id)
      }
    }
  }

  if (orderedEvaluatedDimensionIds.length === 0) {
    return { ok: true as const, text: 'No se encontraron evaluaciones de dimensiones.' }
  }

  const blocks: string[] = []

  blocks.push(systemPromptGuide.trim())
  blocks.push('')
  blocks.push('---')
  blocks.push('')
  blocks.push('> Las siguientes son notas que he tomado cómo entrevistador/validador técnico en una entrevista 1:1 con el candidato.')
  blocks.push('')
  blocks.push(`## Candidato: ${candidateName || '[Completar]'} `)
  blocks.push('')

  for (const dimId of orderedEvaluatedDimensionIds) {
    const dimInfo = idToDimension.get(dimId)
    const title = dimInfo?.name || `Dimension ${dimId}`
    const questionsBlock = dimInfo?.questionsBlock
    const existingNotes = dimensionIdToExistingNotes.get(dimId)

    blocks.push(`## ${title}`)
    if (questionsBlock) blocks.push(questionsBlock)
    if (existingNotes) blocks.push(`Mis notas son: ${existingNotes}`)
    blocks.push('')
  }

  if (Array.isArray(mainStackEvaluations) && mainStackEvaluations.length > 0) {
    const evalByStackId = new Map<string, string>()

    for (const e of mainStackEvaluations) {
      const rawId = e?.mainStack?.id
      const stackId = typeof rawId === 'string' ? rawId.trim() : ''
      if (!stackId) continue

      const rawConclusion = e?.conclusion
      const conclusionText = typeof rawConclusion === 'string' ? rawConclusion.trim() : ''
      if (!conclusionText) continue

      evalByStackId.set(stackId, conclusionText)
    }

    const stackBlocks: string[] = []
    if (Array.isArray(mainStacks) && mainStacks.length > 0) {
      for (const s of mainStacks) {
        const id = typeof s?.id === 'string' ? s.id.trim() : ''
        const name = typeof s?.name === 'string' ? s.name.trim() : ''
        if (!id || !name) continue

        const conclusionText = evalByStackId.get(id)
        if (!conclusionText) continue

        const selectedTopicIds = mainStackIdToTopicIds.get(id)
        const topicQuestionsParts: string[] = []
        const topics = s?.topics
        if (selectedTopicIds && Array.isArray(topics)) {
          for (const topic of topics) {
            const topicId = typeof topic?.id === 'string' ? topic.id.trim() : ''
            if (!topicId || !selectedTopicIds.has(topicId)) continue

            const topicName = typeof topic?.name === 'string' ? topic.name.trim() : ''
            const q = typeof topic?.questions === 'string' ? topic.questions.trim() : ''
            if (!q) continue

            const filtered = filterAndNumberQuestionLines(q)
            if (!filtered) continue

            if (topicName) {
              topicQuestionsParts.push(`#### ${topicName}\n\n${filtered}`)
            } else {
              topicQuestionsParts.push(filtered)
            }
          }
        }

        const topicQuestionsText = topicQuestionsParts.length > 0 ? topicQuestionsParts.join('\n\n') : ''
        const stackQuestionsBlock = topicQuestionsText ? `<!--\nPreguntas (guía):\n\n${topicQuestionsText}\n-->` : ''

        if (stackQuestionsBlock) {
          stackBlocks.push(`### ${name}\n\n${stackQuestionsBlock}\n\nMis notas son: ${conclusionText}`)
        } else {
          stackBlocks.push(`### ${name}\n\nMis notas son: ${conclusionText}`)
        }
      }
    } else {
      for (const [stackId, conclusionText] of evalByStackId.entries()) {
        const stackName = mainStackIdToName.get(stackId) || `MainStack ${stackId}`
        stackBlocks.push(`### ${stackName}\n\nMis notas son: ${conclusionText}`)
      }
    }

    if (stackBlocks.length > 0) {
      blocks.push(...stackBlocks.join('\n\n').split('\n'))
      blocks.push('')
    }
  }

  if (interviewConclusion) {
    blocks.push('## Conclusión general')
    blocks.push(`Mis notas son: ${interviewConclusion}`)
    blocks.push('')
  }

  return { ok: true as const, text: blocks.join('\n') }
}
