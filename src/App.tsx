import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { LoginForm } from './components/LoginForm'
import { Modal } from './components/Modal'
import { Toaster } from '@/components/ui/sonner'
import { loginBackofficeUser } from './lib/auth'
import { useInterviews } from './hooks/useInterviews'
import { InterviewsView } from './views/InterviewsView'
import { InterviewDetail } from './views/InterviewDetail'
import { InterviewAssistant } from './views/InterviewAssistant'
import { useUser } from './hooks/useUser'
import { AppProviders } from './providers/AppProviders'

function App() {
  const [loginIdentity, setLoginIdentity] = useState(localStorage.getItem('last-login-email') || '')
  const [loginSecret, setLoginSecret] = useState('')
  const [loginStatus, setLoginStatus] = useState('')
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const { user, saveUser, clearUser, refreshUser } = useUser()
  const queryClient = useQueryClient()

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
    if (!user?.label) {
      setIsLoginOpen(true)
      return
    }
    void refetchInterviews()
  }, [user, refetchInterviews])

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
        const label = getDisplayName(identity)
        const avatar = getAvatarSeed(identity)
        saveUser({ label, avatar, identity })
        localStorage.setItem('last-login-email', identity)
        setIsLoginOpen(false)
        await refetchInterviews()
        void refreshUser()
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      setLoginStatus('Login error: ' + message)
    } finally {
      setIsLoginLoading(false)
    }
  }

  const handleLogout = () => {
    clearUser()
    setLoginStatus('Sesión cerrada.')
    setLoginSecret('')
    queryClient.removeQueries({ queryKey: ['interviews'] })
    setIsLoginOpen(true)
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppProviders>
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
                userLabel={user?.label || ''}
                userAvatar={user?.avatar || ''}
                userPhoto={user?.photoURL}
                onLoginClick={() => setIsLoginOpen(true)}
                onLogoutClick={handleLogout}
              />
            }
          />
          <Route
            path="/interviews"
            element={
              <InterviewsRoute
                userLabel={user?.label || ''}
                userAvatar={user?.avatar || ''}
                userPhoto={user?.photoURL}
                onLoginClick={() => setIsLoginOpen(true)}
                onLogoutClick={handleLogout}
              />
            }
          />
          <Route path="/interviews/:id" element={<InterviewDetail />} />
          <Route path="/interviews/:id/assistant" element={<InterviewAssistant />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppProviders>
    </BrowserRouter>
  )
}

export default App

function InterviewsRoute(props: {
  userLabel: string
  userAvatar: string
  userPhoto?: string
  onLoginClick: () => void
  onLogoutClick: () => void
}) {
  const navigate = useNavigate()
  return (
    <InterviewsView
      userLabel={props.userLabel}
      userAvatar={props.userAvatar}
      userPhoto={props.userPhoto}
      onLoginClick={props.onLoginClick}
      onLogout={props.onLogoutClick}
      onSelect={(id) => navigate(`/interviews/${id}`)}
    />
  )
}
