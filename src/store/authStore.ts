import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AdminUser {
  nombre: string
  email: string
  rol: 'ADMINISTRADOR'
}

interface AuthState {
  user: AdminUser | null
  token: string | null
  setAuth: (user: AdminUser, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _get, store) => ({
      user: null,
      token: null,

      setAuth: (user, token) => set({ user, token }),

      logout: () => {
        store.persist.clearStorage()
        set({ user: null, token: null })
      },
    }),
    {
      name: 'auth-storage-solares-donato',
      version: 1,
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
