import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/shared/router/routes'
import type { EnhancedErrorResponse } from '@/shared/api/errorSchema'
import { authService } from '../service/authService'
import type { LoginRequest, LoginResponse } from '../schemas/auth.schema'

export function useLogin() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const mutation = useMutation<LoginResponse, EnhancedErrorResponse, LoginRequest>({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: async ({ token }) => {
      // Seteamos el token primero para que el interceptor de axios lo mande en /me.
      useAuthStore.setState({ token })
      const me = await authService.me()
      setAuth(me, token)
      navigate(ROUTES.backoffice, { replace: true })
    },
  })

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  }
}
