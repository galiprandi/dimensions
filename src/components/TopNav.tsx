import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

type Props = {
  searchValue: string
  onChangeSearch: (value: string) => void
  userLabel: string
  onOpenLogin: () => void
  statusFilter: 'all' | 'pending' | 'completed'
  seniorityFilter: string
  counts: { pending: number; completed: number; seniorities: Record<string, number> }
  onChangeStatus: (value: 'all' | 'pending' | 'completed') => void
  onChangeSeniority: (value: string) => void
}

export function TopNav(props: Props) {
  return (
    <div className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex-1 flex items-center gap-3">
          <label htmlFor="navSearch" className="sr-only">
            Buscar por nombre
          </label>
          <Input
            id="navSearch"
            placeholder="Buscar por nombre"
            value={props.searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.onChangeSearch(e.target.value)}
            className="max-w-sm"
          />
          <label htmlFor="navStatus" className="sr-only">
            Estado
          </label>
          <NativeSelect
            id="navStatus"
            value={props.statusFilter}
            onChange={(e) => props.onChangeStatus(e.target.value as Props['statusFilter'])}
          >
            <NativeSelectOption value="all">Todos ({props.counts.pending + props.counts.completed})</NativeSelectOption>
            <NativeSelectOption value="pending">Pending ({props.counts.pending})</NativeSelectOption>
            <NativeSelectOption value="completed">Completed ({props.counts.completed})</NativeSelectOption>
          </NativeSelect>

          <label htmlFor="navSeniority" className="sr-only">
            Seniority
          </label>
          <NativeSelect
            id="navSeniority"
            value={props.seniorityFilter}
            onChange={(e) => props.onChangeSeniority(e.target.value)}
          >
            <NativeSelectOption value="">Todas las seniorities</NativeSelectOption>
            {Object.entries(props.counts.seniorities).map(([seniority, count]) => (
              <NativeSelectOption key={seniority} value={seniority}>
                {seniority.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ({count})
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        <div className="flex items-center gap-3">
          {props.userLabel ? (
            <div className="text-sm bg-muted px-2 py-1 rounded-md border">
              {props.userLabel}
            </div>
          ) : (
            <Button variant="outline" onClick={props.onOpenLogin} size="sm">
              Login
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
