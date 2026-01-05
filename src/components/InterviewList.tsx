import { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Globe, FileText } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { SeniorityBadge } from './SeniorityBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AiProfileModal } from '@/components/ui/ai-profile-modal'

interface InterviewListItem {
  id: string
  candidate: string
  status: string
  profile: string
  photoURL: string
  seniority: string
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

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<string>('')
  const [open, setOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Profile</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
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
            <TableHead>Seniority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>AI Profile</TableHead>
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
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={r.photoURL} alt={r.candidate} />
                    <AvatarFallback>
                      {r.candidate
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span>{r.candidate || '—'}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                <SeniorityBadge seniority={r.seniority} />
              </TableCell>
              <TableCell>
                <StatusBadge status={r.status} />
              </TableCell>
              <TableCell>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedId(r.id)
                    setSelectedCandidate(r.candidate)
                    setOpen(true)
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <FileText className="h-4 w-4" />
                </button>
              </TableCell>
              <TableCell>
                {r.profile ? (
                  <a
                    href={r.profile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Globe className="h-4 w-4" />
                    Ver perfil
                  </a>
                ) : (
                  '—'
                )}
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && !isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No hay entrevistas
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AiProfileModal
        interviewId={selectedId}
        candidateName={selectedCandidate}
        open={open}
        onOpenChange={setOpen}
      />
    </div>
  )
}
