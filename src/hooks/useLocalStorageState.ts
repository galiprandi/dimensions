import { useEffect, useState } from 'react'

export function useLocalStorageState(key: string, initialValue: string) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ?? initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // ignore
    }
  }, [key, value])

  return [value, setValue] as const
}
