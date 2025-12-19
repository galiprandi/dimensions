export function numberQuestionLines(raw: string) {
  const lines = raw.split('\n').map((l) => l.trimEnd())

  let i = 1
  const out: string[] = []

  for (const line of lines) {
    const t = line.trimStart()

    const isDashedQuestion = t.startsWith('-') && /^-\s*¿/.test(t)
    const isPlainQuestion = /^¿/.test(t)

    if (!isDashedQuestion && !isPlainQuestion) {
      out.push(line)
      continue
    }

    const questionText = isDashedQuestion ? t.replace(/^-\s*/, '') : t
    out.push(`${i}. ${questionText}`)
    i++
  }

  return out.join('\n')
}

export function filterAndNumberQuestionLines(raw: string) {
  const lines = raw
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)

  const keep = lines.filter((l) => {
    const t = l.trimStart()
    if (t.startsWith('-')) return /^-\s*¿/.test(t)
    return /^¿/.test(t)
  })

  return numberQuestionLines(keep.join('\n'))
}
