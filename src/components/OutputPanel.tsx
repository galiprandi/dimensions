import { type ReactNode, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

type Props = {
  markdown: string
  defaultMessage: string
}

export function OutputPanel(props: Props) {
  const markdownComponents = useMemo(() => {
    return {
      p: ({ children }: { children?: ReactNode }) => {
        const first = Array.isArray(children) ? children[0] : children
        const firstText = typeof first === 'string' ? first : ''

        if (firstText.startsWith('Mis notas son:')) {
          return <p className="rounded-md border border-border bg-muted/50 px-3 py-2 font-medium text-foreground">{children}</p>
        }

        return <p className="leading-relaxed text-sm text-foreground">{children}</p>
      },
      h1: ({ children }: { children?: ReactNode }) => (
        <h1 className="text-lg font-semibold text-foreground mt-4 mb-2">{children}</h1>
      ),
      h2: ({ children }: { children?: ReactNode }) => (
        <h2 className="text-base font-semibold text-foreground mt-3 mb-1.5">{children}</h2>
      ),
      ul: ({ children }: { children?: ReactNode }) => (
        <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">{children}</ul>
      ),
      ol: ({ children }: { children?: ReactNode }) => (
        <ol className="list-decimal pl-5 space-y-1 text-sm text-foreground">{children}</ol>
      ),
      li: ({ children }: { children?: ReactNode }) => <li className="leading-relaxed">{children}</li>,
    }
  }, [])

  return (
    <div className="border rounded-lg bg-card p-4">
      <ReactMarkdown components={markdownComponents}>
        {props.markdown || props.defaultMessage}
      </ReactMarkdown>
    </div>
  )
}
