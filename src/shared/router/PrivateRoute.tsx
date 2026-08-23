import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from './routes'

function isJwtExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.')
    if (!payload) return true
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof json.exp !== 'number') return false
    return json.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function PrivateRoute() {
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const location = useLocation()

  if (!token || isJwtExpired(token)) {
    if (token) logout()
    return <Navigate to={ROUTES.backofficeLogin} state={{ from: location }} replace />
  }

  return <Outlet />
}
