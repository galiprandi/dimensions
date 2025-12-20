import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { LoginForm } from './components/LoginForm'
import { Modal } from './components/Modal'
import { Toaster } from '@/components/ui/sonner'
import { loginBackofficeUser } from './lib/auth'
import { useInterviews } from './hooks/useInterviews'
import { InterviewsView } from './views/InterviewsView'
import { InterviewDetail } from './views/InterviewDetail'

function App() {
  const [loginIdentity, setLoginIdentity] = useState('')
  const [loginSecret, setLoginSecret] = useState('')
  const [loginStatus, setLoginStatus] = useState('')
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [loggedInUserLabel, setLoggedInUserLabel] = useState('')
  const [loggedInUserAvatar, setLoggedInUserAvatar] = useState('')

  const { refetch: refetchInterviews } = useInterviews()

  const getDisplayName = (identity: string) => {
    const trimmed = identity.trim()
    if (trimmed.includes('@')) return trimmed.split('@')[0] || trimmed
    return trimmed
  }

  const getAvatarSeed = (identity: string) => {
    const trimmed = identity.trim()
    if (!trimmed) return ''
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
        setLoggedInUserAvatar(getAvatarSeed(identity))
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

  const handleLogout = () => {
    setLoggedInUserLabel('')
    setLoggedInUserAvatar('')
    setLoginStatus('Sesión cerrada.')
    setIsLoginOpen(false)
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
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

      <Toaster position="top-right" />

      <Routes>
        <Route
          path="/"
          element={
            <InterviewsRoute
              userLabel={loggedInUserLabel}
              userAvatar={loggedInUserAvatar}
              onLoginClick={() => setIsLoginOpen(true)}
              onLogoutClick={handleLogout}
            />
          }
        />
        <Route
          path="/interviews"
          element={
            <InterviewsRoute
              userLabel={loggedInUserLabel}
              userAvatar={loggedInUserAvatar}
              onLoginClick={() => setIsLoginOpen(true)}
              onLogoutClick={handleLogout}
            />
          }
        />
        <Route
          path="/interviews/:id"
          element={
            <InterviewDetail />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

function InterviewsRoute(props: {
  userLabel: string
  userAvatar: string
  onLoginClick: () => void
  onLogoutClick: () => void
}) {
  const navigate = useNavigate()
  return (
    <InterviewsView
      userLabel={props.userLabel}
      userAvatar={props.userAvatar}
      onLoginClick={props.onLoginClick}
      onLogout={props.onLogoutClick}
      onSelect={(id) => navigate(`/interviews/${id}`)}
    />
  )
}
