export type Environment = 'development' | 'production'

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? ''
}

export function getCurrentEnvironment(): Environment {
  return import.meta.env.DEV ? 'development' : 'production'
}

export function isMswEnabled(): boolean {
  // El && con DEV vuelve estructuralmente imposible activar MSW en un build de prod
  // aunque alguien deje VITE_USE_MSW=true en una env var de Vercel por error — DEV es
  // false en cualquier build de producción, sin importar el valor de la otra variable.
  // Nota: el gate real que saca el chunk de mocks del bundle está inline en main.tsx,
  // no acá — llamar a esta función desde otro módulo le esconde a esbuild que el
  // resultado es un literal, y el chunk queda huérfano (sin ejecutarse, pero servido).
  // Esta función existe para el resto de la app y para poder testearla en aislado.
  return import.meta.env.DEV && import.meta.env.VITE_USE_MSW === 'true'
}
