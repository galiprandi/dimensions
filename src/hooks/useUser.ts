import { useState } from 'react'

type User = {
  label: string
  avatar: string
  identity: string
  photoURL?: string
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

  return { user, saveUser, clearUser }
}
