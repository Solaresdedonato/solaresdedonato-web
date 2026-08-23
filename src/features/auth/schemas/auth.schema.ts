import { z } from 'zod'
import type { AdminUser } from '@/store/authStore'

export const loginFormSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export type UsuarioAdminMe = AdminUser
