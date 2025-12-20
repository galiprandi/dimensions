interface SeniorityBadgeProps {
  seniority: string
}

export function SeniorityBadge({ seniority }: SeniorityBadgeProps) {
  const formatSeniority = (key: string): string => {
    if (!key || key.trim() === '') return ''

    const formatted = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return formatted
  }

  const formatted = formatSeniority(seniority)
  return formatted ? <span>{formatted}</span> : null
}
