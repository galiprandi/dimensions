import { useMemo, useState } from 'react'
import { TopNav } from '@/components/TopNav'
import { InterviewList } from '@/components/InterviewList'
import { useInterviews } from '@/hooks/useInterviews'

interface Props {
  userLabel: string
  userAvatar: string
  userPhoto?: string
  onLoginClick: () => void
  onLogout: () => void
  onSelect: (id: string) => void
}

export function InterviewsView({
  userLabel,
  userAvatar,
  userPhoto,
  onLoginClick,
  onLogout,
  onSelect,
}: Props) {
  const { data: interviews, isLoading: isInterviewsLoading, error: interviewsError } = useInterviews()
  const [uiSearch, setUiSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [seniorityFilter, setSeniorityFilter] = useState('')

  const counts = useMemo(() => {
    let pending = 0
    let completed = 0
    const seniorities: Record<string, number> = {}
    interviews?.forEach((i) => {
      const s = (i.status || '').toLowerCase()
      if (s.includes('pending')) pending += 1
      else if (s.includes('complete') || s.includes('done')) completed += 1

      const seniority = i.seniority || ''
      if (seniority) {
        seniorities[seniority] = (seniorities[seniority] || 0) + 1
      }
    })
    return { pending, completed, seniorities }
  }, [interviews])

  const filtered = useMemo(() => {
    const term = uiSearch.trim().toLowerCase()
    const statusFiltered = interviews?.filter((i) => {
      const s = (i.status || '').toLowerCase()
      if (statusFilter === 'pending') return s.includes('pending')
      if (statusFilter === 'completed') return s.includes('complete') || s.includes('done')
      return true
    }) || []

    const seniorityFiltered = seniorityFilter
      ? statusFiltered.filter((i) => i.seniority === seniorityFilter)
      : statusFiltered

    if (!term) return seniorityFiltered
    return seniorityFiltered.filter((i) => (i.candidate || '').toLowerCase().includes(term))
  }, [uiSearch, statusFilter, seniorityFilter, interviews])

  return (
    <div className="min-h-screen bg-background">
      <TopNav
        searchValue={uiSearch}
        onChangeSearch={setUiSearch}
        userLabel={userLabel}
        userAvatar={userAvatar}
        userPhoto={userPhoto}
        onOpenLogin={onLoginClick}
        onLogout={onLogout}
        statusFilter={statusFilter}
        seniorityFilter={seniorityFilter}
        counts={counts}
        onChangeStatus={setStatusFilter}
        onChangeSeniority={setSeniorityFilter}
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
