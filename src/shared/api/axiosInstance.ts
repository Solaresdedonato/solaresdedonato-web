import axios from 'axios'
import type { AxiosError, AxiosInstance } from 'axios'
import { getApiBaseUrl, getCurrentEnvironment } from '../config/config'
import {
  ErrorResponseSchema,
  type EnhancedErrorResponse,
  createNetworkError,
  createUnknownError,
} from './errorSchema'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '../router/routes'

export function parseApiError(error: unknown): EnhancedErrorResponse {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError

    if (!axiosError.response) {
      return createNetworkError(axiosError)
    }

    const status = axiosError.response.status
    const data = axiosError.response.data

    const parsed = ErrorResponseSchema.safeParse(data)
    if (parsed.success) {
      return { ...parsed.data, status }
    }

    const bodyMessage = (data as { message?: string })?.message
    return {
      timestamp: new Date().toISOString(),
      codigoError: `HTTP_${status}`,
      message: bodyMessage || axiosError.message || 'Error en la solicitud',
      detail: null,
      status,
    }
  }

  return createUnknownError(error)
}

function attachInterceptors(instance: AxiosInstance): void {
  instance.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) config.headers.Authorization = `Bearer ${token}`

    if (getCurrentEnvironment() === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config)
    }

    return config
  })

  instance.interceptors.response.use(
    (response) => {
      if (getCurrentEnvironment() === 'development') {
        console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
      }
      return response
    },
    (error) => {
      const parsedError = parseApiError(error)

      if (getCurrentEnvironment() === 'development') {
        console.error('[API] Error:', {
          url: error.config?.url,
          method: error.config?.method,
          status: parsedError.status,
          codigoError: parsedError.codigoError,
          message: parsedError.message,
        })
      }

      if (parsedError.status === 401) {
        useAuthStore.getState().logout()
        window.location.href = ROUTES.backofficeLogin
      }

      return Promise.reject(parsedError)
    }
  )
}

let apiInstance: AxiosInstance | null = null

const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
  })

  attachInterceptors(instance)
  return instance
}

const getApi = (): AxiosInstance => {
  if (!apiInstance) {
    apiInstance = createApiInstance()
  }
  return apiInstance
}

export const api = new Proxy({} as AxiosInstance, {
  get: (_target, prop) => getApi()[prop as keyof AxiosInstance],
})
