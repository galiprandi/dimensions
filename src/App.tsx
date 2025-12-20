import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { LoginForm } from './components/LoginForm'
import { Modal } from './components/Modal'
import { InterviewList } from './components/InterviewList'
import { OutputPanel } from './components/OutputPanel'
import { TopNav } from './components/TopNav'
import { Button } from './components/ui/button'
import { useLocalStorageState } from './hooks/useLocalStorageState'
import { loginBackofficeUser } from './lib/auth'
import { fetchInterviews } from './lib/interviews'
import { fetchInterviewPrompt } from './lib/interviewPrompt'

function App() {
  const [interviewId, setInterviewId] = useLocalStorageState('dimensions.interviewId', '')
  const [output, setOutput] = useState('')

  const [loginIdentity, setLoginIdentity] = useState('')
  const [loginSecret, setLoginSecret] = useState('')
  const [loginStatus, setLoginStatus] = useState('')
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loggedInUserLabel, setLoggedInUserLabel] = useState('')

  const [uiSearch, setUiSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [interviews, setInterviews] = useState<Awaited<ReturnType<typeof fetchInterviews>>['items']>([])
  const [interviewsError, setInterviewsError] = useState('')
  const [isInterviewsLoading, setIsInterviewsLoading] = useState(false)
  const counts = useMemo(() => {
    let pending = 0
    let completed = 0
    interviews.forEach((i) => {
      const s = (i.status || '').toLowerCase()
      if (s.includes('pending')) pending += 1
      else if (s.includes('complete') || s.includes('done')) completed += 1
    })
    return { pending, completed }
  }, [interviews])
  const defaultOutputMessage = useMemo(() => {
    return 'Ingresá un Interview ID y presioná "Buscar y extraer".'
  }, [])

  const getDisplayName = (identity: string) => {
    const trimmed = identity.trim()
    if (trimmed.includes('@')) return trimmed.split('@')[0] || trimmed
    return trimmed
  }

  const loadInterviews = async (search: string = '') => {
    setIsInterviewsLoading(true)
    setInterviewsError('')
    try {
      const res = await fetchInterviews({ search, take: 100, skip: 0 })
      if (!res.ok) {
        setInterviews([])
        setInterviewsError(res.message)
        return
      }
      setInterviews(res.items)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setInterviewsError(message)
      setInterviews([])
    } finally {
      setIsInterviewsLoading(false)
    }
  }

  useEffect(() => {
    if (!loggedInUserLabel) return
    void loadInterviews('')
  }, [loggedInUserLabel])

  useEffect(() => {
    void loadInterviews('')
     
  }, [])

  const handleLogin = async () => {
    const identity = loginIdentity.trim()
    if (!identity || !loginSecret) return

    setIsLoginLoading(true)
    setLoginStatus('')
    try {
      const result = await loginBackofficeUser({ identity, secret: loginSecret })
      setLoginStatus(result.ok ? 'Login OK (cookie seteada).' : `Login error: ${result.message}`)
      if (result.ok) {
        setLoginSecret('')
        setLoggedInUserLabel(getDisplayName(identity))
        setIsLoginOpen(false)
        await loadInterviews('')
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setLoginStatus('Login error: ' + message)
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleFetchAndExtract = async () => {
    const id = interviewId.trim()
    if (!id) {
      alert('Por favor, ingresá el Interview ID.')
      return
    }

    try {
      const extracted = await fetchInterviewPrompt({ interviewId: id })
      setOutput(extracted.text)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setOutput('Error de red.\n\n' + message)
    }
  }

  return (
    <BrowserRouter>
      <TopNav
        searchValue={uiSearch}
        onChangeSearch={setUiSearch}
        userLabel={loggedInUserLabel}
        onOpenLogin={() => setIsLoginOpen(true)}
        statusFilter={statusFilter}
        counts={{ pending: counts.pending, completed: counts.completed }}
        onChangeStatus={setStatusFilter}
      />

      <Modal title="Login" open={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <LoginForm
          identity={loginIdentity}
          secret={loginSecret}
          isLoading={isLoginLoading}
          status={loginStatus}
          onChangeIdentity={setLoginIdentity}
          onChangeSecret={setLoginSecret}
          onLogin={handleLogin}
        />
      </Modal>

      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <FilteredRoutes
            uiSearch={uiSearch}
            interviews={interviews}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            isInterviewsLoading={isInterviewsLoading}
            interviewsError={interviewsError}
            loadInterviews={loadInterviews}
            setInterviewId={setInterviewId}
            interviewId={interviewId}
            output={output}
            defaultOutputMessage={defaultOutputMessage}
            handleFetchAndExtract={handleFetchAndExtract}
          />
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App

function FilteredRoutes(props: {
  uiSearch: string
  interviews: Awaited<ReturnType<typeof fetchInterviews>>['items']
  statusFilter: 'all' | 'pending' | 'completed'
  setStatusFilter: (v: 'all' | 'pending' | 'completed') => void
  isInterviewsLoading: boolean
  interviewsError: string
  loadInterviews: (search?: string) => Promise<void>
  setInterviewId: (id: string) => void
  interviewId: string
  output: string
  defaultOutputMessage: string
  handleFetchAndExtract: () => Promise<void>
}) {
  const filtered = useMemo(() => {
    const term = props.uiSearch.trim().toLowerCase()
    const statusFiltered = props.interviews.filter((i) => {
      const s = (i.status || '').toLowerCase()
      if (props.statusFilter === 'pending') return s.includes('pending')
      if (props.statusFilter === 'completed') return s.includes('complete') || s.includes('done')
      return true
    })
    if (!term) return statusFiltered
    return statusFiltered.filter((i) => (i.professionalName || '').toLowerCase().includes(term))
  }, [props.interviews, props.uiSearch, props.statusFilter])

  return (
    <Routes>
      <Route
        path="/interviews"
        element={
          <InterviewListRoute
            interviews={filtered}
            isInterviewsLoading={props.isInterviewsLoading}
            interviewsError={props.interviewsError}
            loadInterviews={props.loadInterviews}
            setInterviewId={props.setInterviewId}
          />
        }
      />
      <Route
        path="/interviews/:id"
        element={
          <PromptRoute
            interviewId={props.interviewId}
            setInterviewId={props.setInterviewId}
            output={props.output}
            defaultOutputMessage={props.defaultOutputMessage}
            onFetch={props.handleFetchAndExtract}
          />
        }
      />
      <Route path="*" element={<Navigate to="/interviews" replace />} />
    </Routes>
  )
}

function InterviewListRoute(props: {
  interviews: Awaited<ReturnType<typeof fetchInterviews>>['items']
  isInterviewsLoading: boolean
  interviewsError: string
  loadInterviews: (search?: string) => Promise<void>
  setInterviewId: (id: string) => void
}) {
  const navigate = useNavigate()
  return (
    <InterviewList
      items={props.interviews}
      isLoading={props.isInterviewsLoading}
      error={props.interviewsError}
      onSelect={(id) => {
        props.setInterviewId(id)
        navigate(`/interviews/${id}`)
      }}
    />
  )
}

function PromptRoute(props: {
  interviewId: string
  setInterviewId: (id: string) => void
  output: string
  defaultOutputMessage: string
  onFetch: () => Promise<void>
}) {
  const params = useParams()
  const navigate = useNavigate()
  const { interviewId, setInterviewId, output, defaultOutputMessage, onFetch } = props

  useEffect(() => {
    const id = (params.id || '').trim()
    if (id && id !== interviewId) {
      setInterviewId(id)
    }
  }, [params.id, interviewId, setInterviewId])

  useEffect(() => {
    const id = (params.id || '').trim()
    if (!id) return
    void onFetch()
  }, [params.id, onFetch])

  const hasPrompt = output.trim().length > 0
  const notes = hasPrompt ? 'Notas tomadas:\n\n- Revisar persistencia y performance.\n- Confirmar decisiones de arquitectura.' : 'Sin notas cargadas.'

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/interviews')}>
          Volver a la lista
        </Button>
        <Button size="sm" onClick={() => void onFetch()}>
          Generar prompt
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (!hasPrompt) return
            await navigator.clipboard.writeText(output)
          }}
          disabled={!hasPrompt}
        >
          Copiar prompt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded-lg bg-card p-4 space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Entrevista</div>
          <div className="text-sm"><span className="font-medium">ID:</span> {interviewId}</div>
          <div className="text-sm"><span className="font-medium">Prompt listo:</span> {hasPrompt ? 'Sí' : 'No'}</div>
        </div>
        <div className="border rounded-lg bg-card p-4 space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Estado</div>
          <div className="text-sm"><span className="font-medium">Descarga:</span> {hasPrompt ? 'Completada' : 'Pendiente'}</div>
          <div className="text-sm"><span className="font-medium">Longitud:</span> {hasPrompt ? `${output.length} chars` : '—'}</div>
        </div>
      </div>

      <div className="border rounded-lg bg-card p-4 space-y-2">
        <div className="text-sm font-semibold text-foreground">Prompt</div>
        <OutputPanel markdown={output} defaultMessage={defaultOutputMessage} />
      </div>

      <div className="border rounded-lg bg-card p-4 space-y-2">
        <div className="text-sm font-semibold text-foreground">Notas tomadas</div>
        <div className="text-sm text-foreground whitespace-pre-wrap">{notes}</div>
      </div>
    </div>
  )
}
