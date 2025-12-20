import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { LoginForm } from './components/LoginForm'
import { Modal } from './components/Modal'
import { Toaster } from '@/components/ui/sonner'
import { loginBackofficeUser } from './lib/auth'
import { useInterviewsQuery } from './hooks/useInterviewsQuery'
import { InterviewsView } from './views/InterviewsView'
import { InterviewDetailView } from './views/InterviewDetailView'
import type { InterviewListItem } from '@/types/interviews'

function App() {
  const [loginIdentity, setLoginIdentity] = useState('')
  const [loginSecret, setLoginSecret] = useState('')
  const [loginStatus, setLoginStatus] = useState('')
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loggedInUserLabel, setLoggedInUserLabel] = useState('')

  const { data: interviewsData, isLoading: isInterviewsLoading, error: interviewsError, refetch: refetchInterviews } =
    useInterviewsQuery('')
  const defaultOutputMessage = 'Ingresá un Interview ID y presioná "Buscar y extraer".'

  const getDisplayName = (identity: string) => {
    const trimmed = identity.trim()
    if (trimmed.includes('@')) return trimmed.split('@')[0] || trimmed
    return trimmed
  }

  useEffect(() => {
    if (!loggedInUserLabel) return
    void refetchInterviews()
  }, [loggedInUserLabel, refetchInterviews])

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
        await refetchInterviews()
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setLoginStatus('Login error: ' + message)
    } finally {
      setIsLoginLoading(false)
    }
  }

  return (
    <BrowserRouter>
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

      <Toaster />

      <Routes>
        <Route
          path="/interviews"
          element={
            <InterviewsRoute
              interviews={interviewsData?.items || []}
              isInterviewsLoading={isInterviewsLoading}
              interviewsError={interviewsError ? interviewsError.message : ''}
              userLabel={loggedInUserLabel}
              onLoginClick={() => setIsLoginOpen(true)}
            />
          }
        />
        <Route
          path="/interviews/:id"
          element={
            <InterviewDetailView
              defaultOutputMessage={defaultOutputMessage}
            />
          }
        />
        <Route path="*" element={<Navigate to="/interviews" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

function InterviewsRoute(props: {
  interviews: InterviewListItem[]
  isInterviewsLoading: boolean
  interviewsError: string
  userLabel: string
  onLoginClick: () => void
}) {
  const navigate = useNavigate()
  return (
    <InterviewsView
      interviews={props.interviews}
      isInterviewsLoading={props.isInterviewsLoading}
      interviewsError={props.interviewsError}
      userLabel={props.userLabel}
      onLoginClick={props.onLoginClick}
      onSelect={(id) => navigate(`/interviews/${id}`)}
    />
  )
}

