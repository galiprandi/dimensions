import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { InterviewListItem } from '../lib/interviews'

type Props = {
  items: InterviewListItem[]
  isLoading: boolean
  error: string
  onSelect: (id: string) => void
}

export function InterviewList(props: Props) {
  const rows = useMemo(() => {
    const priority = (status: string) => {
      const s = status.toLowerCase()
      if (s.includes('pending')) return 0
      if (s.includes('in progress')) return 1
      if (s.includes('complete') || s.includes('done')) return 2
      return 3
    }
    return [...props.items].sort((a, b) => {
      const pa = priority(a.status)
      const pb = priority(b.status)
      if (pa !== pb) return pa - pb
      // Segundo criterio: "últimas entrevistas arriba". Sin timestamp, usamos id desc como aproximación estable.
      return b.id.localeCompare(a.id)
    })
  }, [props.items])

  return (
    <div className="border rounded-lg bg-card">
      {props.error && <div className="px-4 pt-3 text-sm text-destructive">{props.error}</div>}

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
              onClick={() => props.onSelect(r.id)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium max-w-xs truncate">
                {r.professionalName || '—'}
              </TableCell>
              <TableCell>
                <StatusBadge status={r.status} />
              </TableCell>
              <TableCell>{r.complete ? 'Yes' : 'No'}</TableCell>
              <TableCell>{r.deepProfile ? 'Yes' : 'No'}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && !props.isLoading && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="p-4 text-sm text-muted-foreground border-t">
        {/* removed hint */}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || ''
  let color = 'bg-muted text-muted-foreground'
  if (s.includes('pending')) color = 'bg-amber-100 text-amber-900 border border-amber-200'
  else if (s.includes('in progress')) color = 'bg-blue-100 text-blue-900 border border-blue-200'
  else if (s.includes('complete') || s.includes('done')) color = 'bg-emerald-100 text-emerald-900 border border-emerald-200'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${color}`}>
      {status || '—'}
    </span>
  )
}
