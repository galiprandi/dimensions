import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import type { Query } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60, // 1h
      // Solo persistimos el hook de AI
      gcTime: Infinity,
      retry: false,
    },
  },
})

const persister =
  typeof window !== 'undefined'
    ? createSyncStoragePersister({
        storage: window.localStorage,
        key: 'tq-ai-cache',
        throttleTime: 1000,
      })
    : null

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: persister!,
        buster: 'ai-v1',
        dehydrateOptions: {
          // Solo persistimos las queries de AI (key: ['AI', id])
          shouldDehydrateQuery: (query: Query) =>
            Array.isArray(query.queryKey) && query.queryKey[0] === 'AI',
        },
      }}
    >
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  </StrictMode>,
)
