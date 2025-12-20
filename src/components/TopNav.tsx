import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = {
  searchValue: string
  onChangeSearch: (value: string) => void
  userLabel: string
  onOpenLogin: () => void
  statusFilter: 'all' | 'pending' | 'completed'
  counts: { pending: number; completed: number }
  onChangeStatus: (value: 'all' | 'pending' | 'completed') => void
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
          <select
            id="navStatus"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={props.statusFilter}
            onChange={(e) => props.onChangeStatus(e.target.value as Props['statusFilter'])}
          >
            <option value="all">Todos ({props.counts.pending + props.counts.completed})</option>
            <option value="pending">Pending ({props.counts.pending})</option>
            <option value="completed">Completed ({props.counts.completed})</option>
          </select>
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
