import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'

type User = {
  label: string
  avatar: string
  identity: string
  photoURL?: string
  id?: string
}

const STORAGE_KEY = 'user-session'

function readFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as User
    return parsed?.label ? parsed : null
  } catch {
    return null
  }
}

export function useUser() {
  const [user, setUser] = useState<User | null>(() => readFromStorage())

  const saveUser = (u: User) => {
    setUser(u)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
  }

  const clearUser = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiClient.post('', {
        query: `query {
          authenticatedItem {
            __typename
            ... on BackofficeUser {
              id
              name
              email
              photoURL
            }
          }
        }`,
      })
      const auth = res.data?.data?.authenticatedItem
      if (auth?.__typename === 'BackofficeUser') {
        const name = typeof auth.name === 'string' ? auth.name : ''
        const email = typeof auth.email === 'string' ? auth.email : ''
        const label = name || email || 'User'
        const avatar = email || name || ''
        const next: User = {
          id: auth.id,
          label,
          avatar,
          identity: email || label,
          photoURL: auth.photoURL || undefined,
        }
        saveUser(next)
      }
    } catch {
      // ignore failures; likely not authenticated
    }
  }, [])

  useEffect(() => {
    if (user) return
    const timer = setTimeout(() => {
      void refreshUser()
    }, 0)
    return () => clearTimeout(timer)
  }, [user, refreshUser])

  return { user, saveUser, clearUser, refreshUser }
}
