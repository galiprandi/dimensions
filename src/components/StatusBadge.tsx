import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase()
    if (s.includes('completed') || s.includes('completada')) {
      return {
        label: 'Completada',
        className: 'text-emerald-600 border-emerald-200 bg-emerald-50'
      }
    }
    if (s.includes('pending') || s.includes('pendiente')) {
      return {
        label: 'Pendiente',
        className: 'text-red-600 border-red-200 bg-red-50'
      }
    }
    return {
      label: status,
      className: 'text-muted-foreground border-border bg-background'
    }
  }

  const { label, className } = getStatusConfig(status)

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
