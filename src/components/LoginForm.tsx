import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Props = {
  identity: string
  secret: string
  isLoading: boolean
  status: string
  onChangeIdentity: (value: string) => void
  onChangeSecret: (value: string) => void
  onLogin: () => void
}

export function LoginForm(props: Props) {
  const { identity, secret, isLoading, status, onChangeIdentity, onChangeSecret, onLogin } = props
  const isDisabled = isLoading || !identity.trim() || !secret
  const isError = status.toLowerCase().includes('error') || status.toLowerCase().includes('fail')

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="identity" className="text-sm font-medium text-muted-foreground">
          Login (email)
        </label>
        <Input
          id="identity"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="email@dominio.com"
          value={identity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeIdentity(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="secret" className="text-sm font-medium text-muted-foreground">
          Password
        </label>
        <Input
          id="secret"
          type="password"
          name="current-password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={secret}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeSecret(e.target.value)}
        />
      </div>

      <Button type="button" onClick={onLogin} disabled={isDisabled} className="w-full">
        {isLoading ? 'Logging in…' : 'Login'}
      </Button>

      {status ? (
        <div className={`text-sm ${isError ? 'text-destructive' : 'text-muted-foreground'}`}>{status}</div>
      ) : null}
    </div>
  )
}
