import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { queryClient } from './app/queryClient'
import { router } from './app/router'

async function prepare() {
  // Chequeo inline, NO vía isMswEnabled() (config.ts): import.meta.env.DEV e
  // import.meta.env.VITE_USE_MSW se reemplazan por literales en ESTE archivo — con eso,
  // esbuild puede eliminar la rama entera (el await import() incluido) antes de que
  // Rollup arme el grafo de chunks, así que en build de prod el chunk de mocks/browser.ts
  // no llega a existir. Pasando por una función de otro módulo, Vite no puede probar en
  // este archivo que siempre devuelve false, y el chunk queda huérfano en el bundle
  // igual (nunca se ejecuta, pero se descarga de más) — se verificó armando el build y
  // confirmando que dist/assets/ no tiene un chunk de mocks.
  if (import.meta.env.DEV && import.meta.env.VITE_USE_MSW === 'true') {
    const { worker } = await import('./mocks/browser')
    // 'warn' en vez de 'bypass': un path mal escrito o un handler que falta debe verse
    // en la consola, no irse en silencio a la red real.
    await worker.start({ onUnhandledRequest: 'warn' })
    console.info('[MSW] mocks activos para /v1/*')
  }
}

prepare().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>
  )
})
