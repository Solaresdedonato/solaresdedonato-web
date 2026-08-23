import type { PageDto } from '@/shared/api/types'
import type { ErrorResponse } from '@/shared/api/errorSchema'

export function paginate<T>(items: T[], url: URL): PageDto<T> {
  const page = Number(url.searchParams.get('page') ?? 0)
  const size = Number(url.searchParams.get('size') ?? 20)
  const start = page * size
  return {
    content: items.slice(start, start + size),
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
    size,
    number: page,
  }
}

export function mockError(
  codigoError: string,
  message: string,
  detail: Record<string, unknown> | null = null
): ErrorResponse {
  return { timestamp: new Date().toISOString(), codigoError, message, detail }
}

export function nextId<T extends { id: number }>(items: T[]): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

function base64url(obj: unknown): string {
  const json = JSON.stringify(obj)
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** JWT con forma válida (header.payload.firma) para que `isJwtExpired` del front lo pueda decodificar. */
export function buildMockJwt(email: string): string {
  const header = base64url({ alg: 'HS256', typ: 'JWT' })
  const payload = base64url({ sub: email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8 })
  return `${header}.${payload}.mock-signature`
}
