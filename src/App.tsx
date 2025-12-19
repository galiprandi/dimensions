import { useMemo, useState } from 'react'
import { AppStyles } from './components/AppStyles'
import { HeaderForm } from './components/HeaderForm'
import { OutputPanel } from './components/OutputPanel'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { fetchInterviewPrompt } from './lib/interviewPrompt'

function App() {
  const [interviewId, setInterviewId] = useLocalStorageState('dimensions.interviewId', '')
  const [sessionCookie, setSessionCookie] = useLocalStorageState('dimensions.keystonejsSession', '')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  const defaultOutputMessage = useMemo(() => {
    return 'Ingresá un Interview ID y presioná "Buscar y extraer".'
  }, [])

  const handleFetchAndExtract = async () => {
    const id = interviewId.trim()
    if (!id) {
      alert('Por favor, ingresá el Interview ID.')
      return
    }

    setIsLoading(true)
    try {
      const extracted = await fetchInterviewPrompt({ interviewId: id, sessionCookie })
      setOutput(extracted.text)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setOutput('Error de red.\n\n' + message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    const textToCopy = output.trim()
    if (!textToCopy) return

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopyStatus('Copiado.')
      window.setTimeout(() => setCopyStatus(''), 1200)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      alert('No se pudo copiar al portapapeles.\n\n' + message)
    }
  }

  return (
    <>
      <AppStyles />

      <div className="container">
        <HeaderForm
          interviewId={interviewId}
          sessionCookie={sessionCookie}
          isLoading={isLoading}
          canCopy={!!output.trim()}
          copyStatus={copyStatus}
          onChangeInterviewId={setInterviewId}
          onChangeSessionCookie={setSessionCookie}
          onFetch={handleFetchAndExtract}
          onCopy={handleCopy}
        />

        <OutputPanel markdown={output} defaultMessage={defaultOutputMessage} />
      </div>
    </>
  )
}

export default App
