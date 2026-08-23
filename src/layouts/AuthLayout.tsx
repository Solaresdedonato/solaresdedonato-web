import type { ReactNode } from 'react'
import styles from './AuthLayout.module.css'

interface AuthLayoutProps {
  children: ReactNode
  subtitle?: string
}

export function AuthLayout({ children, subtitle = 'Ingresá tus credenciales para continuar' }: AuthLayoutProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <p className={styles.marca}>Solares de Donato</p>
          <p className={styles.sub}>Backoffice</p>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
