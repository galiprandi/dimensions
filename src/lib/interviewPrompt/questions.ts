export function filterQuestionLines(raw: string) {
  const lines = raw
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)

  const keep = lines.filter((l) => {
    const t = l.trimStart()
    if (t.startsWith('-')) return /^-\s*¿/.test(t)
    return /^¿/.test(t)
  })

  return keep.join('\n')
}
