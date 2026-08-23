import { z } from 'zod'

/**
 * Único formato de error que devuelve nuestro backend (GlobalExceptionHandler),
 * no hay backends legacy con otros shapes que soportar acá.
 */
export const ErrorResponseSchema = z.object({
  timestamp: z.string(),
  codigoError: z.string(),
  message: z.string(),
  // El backend serializa `detail` como Map<String, Object> (GlobalExceptionHandler),
  // no como string — con z.string() acá, CUALQUIER error con detail no vacío (validación
  // por campo, conflictos con datos extra, etc.) fallaba el safeParse entero y caía al
  // fallback genérico de parseApiError, perdiendo el codigoError real. Bug preexistente,
  // encontrado al modelar el 409 de "foto de Drive ya importada" (detail.contenidoMediaId).
  detail: z.record(z.string(), z.unknown()).nullable(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type EnhancedErrorResponse = ErrorResponse & { status: number }

export function createNetworkError(originalError?: Error): EnhancedErrorResponse {
  return {
    timestamp: new Date().toISOString(),
    codigoError: 'NETWORK_ERROR',
    message: originalError?.message || 'Error de conexión. Verificá tu conexión a internet.',
    detail: null,
    status: 0,
  }
}

export function createUnknownError(originalError?: unknown): EnhancedErrorResponse {
  const message = originalError instanceof Error ? originalError.message : 'Ocurrió un error inesperado'
  return {
    timestamp: new Date().toISOString(),
    codigoError: 'UNKNOWN_ERROR',
    message,
    detail: null,
    status: 500,
  }
}
