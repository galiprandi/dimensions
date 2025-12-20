import aiJsonPromptGuide from '../../prompts/ai-json-conclusions.md?raw'
import systemPromptGuide from '../../prompts/system-prompt-guide.md?raw'

export type DimensionItem = {
  id: string
  dimensionId: string
  label: string
  conclusion: string
  topics?: string[]
}

export type StackItem = {
  id: string
  stackId: string
  label: string
  conclusion: string
  topics?: string[]
}

export function buildJsonPrompt(candidate: string, dimensions: DimensionItem[], stack: StackItem[], profileSummary?: string): string {
  const filteredDimensions = dimensions.filter(dim => dim.conclusion.trim().length > 0)
  const filteredStack = stack.filter(s => s.conclusion.trim().length > 0)

  const blocks: string[] = []
  blocks.push(aiJsonPromptGuide.trim())
  blocks.push('')
  if (profileSummary?.trim()) {
    blocks.push('Reseña del perfil (inferida de LinkedIn/GitHub):')
    blocks.push(profileSummary.trim())
    blocks.push('')
  }
  blocks.push('Notas del entrevistador:')
  if (candidate.trim()) {
    blocks.push(`Candidato: ${candidate.trim()}`)
  }
  blocks.push('')
  if (filteredDimensions.length > 0) {
    blocks.push('Dimensiones:')
    filteredDimensions.forEach(dim => {
      blocks.push(`- ${dim.label} (id: ${dim.dimensionId})`)
      if (dim.topics && dim.topics.length > 0) {
        blocks.push(`> Tópicos validados: ${dim.topics.join(', ')}`)
      }
      blocks.push(`=> ${dim.conclusion}`)
    })
    blocks.push('')
  }
  if (filteredStack.length > 0) {
    blocks.push('Main stacks (contexto):')
    filteredStack.forEach(s => {
      blocks.push(`- ${s.label} (id: ${s.stackId})`)
      if (s.topics && s.topics.length > 0) {
        blocks.push(`> Tópicos validados: ${s.topics.join(', ')}`)
      }
      blocks.push(`=> ${s.conclusion}`)
    })
  }
  return blocks.join('\n').trim()
}

export function stripMarkdownJson(raw: string) {
  const trimmed = raw.trim()
  if (trimmed.startsWith('```')) {
    const withoutFence = trimmed.replace(/^```[a-zA-Z]*\s*/, '').replace(/```$/, '')
    return withoutFence.trim()
  }
  return trimmed
}

export function generateSystemPrompt(candidate: string, dimensions: DimensionItem[], stack: StackItem[]): string {
  const filteredDimensions = dimensions.filter(dim => dim.conclusion.trim().length > 0)
  const filteredStack = stack.filter(s => s.conclusion.trim().length > 0)

  let prompt = systemPromptGuide.trim() + '\n\n---\n\n> Las siguientes son notas que he tomado cómo entrevistador/validador técnico en una entrevista 1:1 con el candidato.\n\n'

  if (candidate.trim()) {
    prompt += `## Candidato: ${candidate.trim()}\n\n`
  }

  let sectionNumber = 0

  filteredDimensions.forEach(dim => {
    sectionNumber++
    prompt += `## ${sectionNumber}. ${dim.label}\n\nMis notas son: ${dim.conclusion}\n\n`
  })

  filteredStack.forEach(s => {
    sectionNumber++
    prompt += `## ${sectionNumber}. ${s.label}\n\nMis notas son: ${s.conclusion}\n\n`
  })

  return prompt.trim()
}
