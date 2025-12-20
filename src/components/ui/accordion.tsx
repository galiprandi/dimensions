import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type AccordionContextValue = {
  openValue: string | null
  onToggle: (value: string) => void
  collapsible: boolean
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

type AccordionProps = {
  type?: 'single'
  collapsible?: boolean
  defaultValue?: string | null
  children: React.ReactNode
  className?: string
}

export function Accordion({ children, defaultValue = null, collapsible = true, className }: AccordionProps) {
  const [openValue, setOpenValue] = React.useState<string | null>(defaultValue ?? null)

  const handleToggle = React.useCallback(
    (value: string) => {
      setOpenValue(prev => (prev === value ? (collapsible ? null : prev) : value))
    },
    [collapsible]
  )

  const ctx: AccordionContextValue = React.useMemo(
    () => ({ openValue, onToggle: handleToggle, collapsible }),
    [openValue, handleToggle, collapsible]
  )

  return (
    <AccordionContext.Provider value={ctx}>
      <div className={cn('divide-y divide-border rounded-md border border-border bg-card', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

type AccordionItemProps = {
  value: string
  children: React.ReactNode
  className?: string
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <div data-accordion-item={value} className={cn('overflow-hidden', className)}>
      {children}
    </div>
  )
}

type AccordionTriggerProps = {
  value?: string
  children: React.ReactNode
  className?: string
}

export function AccordionTrigger({ value, children, className }: AccordionTriggerProps) {
  const ctx = React.useContext(AccordionContext)
  if (!ctx) throw new Error('AccordionTrigger must be used within Accordion')

  const currentValue = value || ''
  const open = ctx.openValue === currentValue

  return (
    <button
      type="button"
      onClick={() => ctx.onToggle(currentValue)}
      className={cn(
        'flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium transition-colors',
        'hover:bg-muted/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        open ? 'bg-muted/60' : 'bg-card',
        className
      )}
    >
      <span>{children}</span>
      <ChevronDown className={cn('h-4 w-4 transition-transform', open ? 'rotate-180' : 'rotate-0')} />
    </button>
  )
}

type AccordionContentProps = {
  value?: string
  children: React.ReactNode
  className?: string
}

export function AccordionContent({ value, children, className }: AccordionContentProps) {
  const ctx = React.useContext(AccordionContext)
  if (!ctx) throw new Error('AccordionContent must be used within Accordion')
  const currentValue = value || ''
  const open = ctx.openValue === currentValue

  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-200',
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      )}
    >
      <div className={cn('overflow-hidden px-4 pb-4 pt-1', className)} aria-hidden={!open}>
        {open && children}
      </div>
    </div>
  )
}
