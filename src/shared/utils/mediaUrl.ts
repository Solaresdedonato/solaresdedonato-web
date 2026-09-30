import { getApiBaseUrl } from '../config/config'

/**
 * El backend ahora persiste `archivoUrl`/`imagenPortadaUrl` como paths relativos
 * (`/media/desarrollo-3/x.jpg`), no URLs absolutas — desacopla las imágenes del host
 * de la API. Esta función antepone VITE_API_URL antes de usarlas, y deja pasar sin
 * tocar cualquier cosa que ya sea absoluta: los seeds de MSW usan URLs de Unsplash, y
 * los videos con URL externa son links de YouTube/Vimeo — ninguno pasó nunca por el
 * backend. Los videos importados de Drive sí vienen relativos (`/v1/contenido/{id}/video`,
 * los streamea la API) y se resuelven acá igual que las fotos.
 */
export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path
  return `${getApiBaseUrl()}${path}`
}
