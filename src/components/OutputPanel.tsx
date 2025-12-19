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
          return <p className="notesLine">{children}</p>
        }

        return <p>{children}</p>
      },
    }
  }, [])

  return (
    <div id="output">
      <div className="outputText">
        <ReactMarkdown components={markdownComponents}>{props.markdown || props.defaultMessage}</ReactMarkdown>
      </div>
    </div>
  )
}
