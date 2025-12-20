import { useMemo, useState } from 'react'
import { TopNav } from '@/components/TopNav'
import { InterviewList } from '@/components/InterviewList'
import { useInterviews } from '@/hooks/useInterviews'

interface Props {
  userLabel: string
  onLoginClick: () => void
  onSelect: (id: string) => void
}

export function InterviewsView({
  userLabel,
  onLoginClick,
  onSelect,
}: Props) {
  const { data: interviews, isLoading: isInterviewsLoading, error: interviewsError } = useInterviews()
  const [uiSearch, setUiSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all')

  const counts = useMemo(() => {
    let pending = 0
    let completed = 0
    interviews?.forEach((i) => {
      const s = (i.status || '').toLowerCase()
      if (s.includes('pending')) pending += 1
      else if (s.includes('complete') || s.includes('done')) completed += 1
    })
    return { pending, completed }
  }, [interviews])

  const filtered = useMemo(() => {
    const term = uiSearch.trim().toLowerCase()
    const statusFiltered = interviews?.filter((i) => {
      const s = (i.status || '').toLowerCase()
      if (statusFilter === 'pending') return s.includes('pending')
      if (statusFilter === 'completed') return s.includes('complete') || s.includes('done')
      return true
    }) || []
    if (!term) return statusFiltered
    return statusFiltered.filter((i) => (i.candidate || '').toLowerCase().includes(term))
  }, [uiSearch, statusFilter, interviews])

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        searchValue={uiSearch}
        onChangeSearch={setUiSearch}
        userLabel={userLabel}
        onOpenLogin={onLoginClick}
        statusFilter={statusFilter}
        counts={counts}
        onChangeStatus={setStatusFilter}
      />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <InterviewList
          items={filtered}
          isLoading={isInterviewsLoading}
          error={interviewsError?.message || ''}
          onSelect={onSelect}
        />
      </div>
    </div>
  )
}
