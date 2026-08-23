import { useCallback } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/shared/router/routes'
import styles from './BackofficeLayout.module.css'

const NAV_ITEMS = [
  { label: 'Inicio', to: ROUTES.backoffice, end: true },
  { label: 'Desarrollos', to: ROUTES.backofficeDesarrollos },
  { label: 'Contenido', to: ROUTES.backofficeContenido },
  { label: 'Consultas', to: ROUTES.backofficeConsultas },
]

export function BackofficeLayout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = useCallback(() => {
    queryClient.clear()
    logout()
    navigate(ROUTES.backofficeLogin, { replace: true })
  }, [queryClient, logout, navigate])

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarMarca}>Solares de Donato</div>
          <div className={styles.sidebarSub}>Backoffice</div>
        </div>

        <div className={styles.nav}>
          <div className={styles.navLabel}>Menú</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              {({ isActive }) => (
                <>
                  <span className={`${styles.navDot} ${isActive ? styles.navDotActive : ''}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.avatar}>{(user?.nombre ?? 'AD').slice(0, 2).toUpperCase()}</div>
          <div style={{ lineHeight: 1.3 }}>
            <div className={styles.userName}>{user?.nombre ?? 'Administrador'}</div>
            <div className={styles.userRole}>{user?.rol ?? 'Administrador'}</div>
          </div>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
            Salir
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <Outlet />
      </div>
    </div>
  )
}
