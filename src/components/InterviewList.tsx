import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { InterviewListItem } from '@/types/interviews'

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

  return (
    <div className="border rounded-lg bg-card">
      {error && <div className="px-4 pt-3 text-sm text-destructive">{error}</div>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Professional</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Complete</TableHead>
            <TableHead>Deep</TableHead>
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
                {r.professionalName || '—'}
              </TableCell>
              <TableCell>{r.status || '—'}</TableCell>
              <TableCell>{r.complete ? 'Yes' : 'No'}</TableCell>
              <TableCell>{r.deepProfile ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
