import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Globe } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'

interface InterviewListItem {
  id: string
  candidate: string
  status: string
  profile: string
}

interface Props {
  items: InterviewListItem[]
  isLoading: boolean
  error: string
  onSelect: (id: string) => void
}

export function InterviewList({ items, isLoading, error, onSelect }: Props) {
  const rows = useMemo(() => {
    const priority = (status: string) => {
      const s = status.toLowerCase()
      if (s.includes('pending')) return 0
      if (s.includes('in progress')) return 1
      if (s.includes('complete') || s.includes('done')) return 2
      return 3
    }
    return [...items].sort((a, b) => {
      const pa = priority(a.status)
      const pb = priority(b.status)
      if (pa !== pb) return pa - pb
      return b.id.localeCompare(a.id)
    })
  }, [items])

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Profile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="border rounded-lg bg-card">
      {error && <div className="px-4 pt-3 text-sm text-destructive">{error}</div>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Profile</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow
              key={r.id}
              onClick={() => onSelect(r.id)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium max-w-xs truncate">
                {r.candidate || '—'}
              </TableCell>
              <TableCell>
                <StatusBadge status={r.status} />
              </TableCell>
              <TableCell>
                {r.profile ? (
                  <a href={r.profile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Globe className="h-4 w-4" />
                    Profile
                  </a>
                ) : '—'}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
