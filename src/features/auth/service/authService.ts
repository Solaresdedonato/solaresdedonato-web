import { api } from '@/shared/api/axiosInstance'
import type { LoginRequest, LoginResponse, UsuarioAdminMe } from '../schemas/auth.schema'

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>('/v1/auth/login', credentials)
    return data
  },

  me: async (): Promise<UsuarioAdminMe> => {
    const { data } = await api.get<UsuarioAdminMe>('/v1/usuario-admin/me')
    return data
  },
}
