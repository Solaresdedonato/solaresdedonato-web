import { Link as RouterLink } from 'react-router-dom'
import bo from '@/styles/backoffice.module.css'
import { ROUTES } from '@/shared/router/routes'
import { LoadingScreen } from '@/shared/components/LoadingScreen'
import { useResumenDesarrollos } from '@/features/desarrollo/hooks/useDesarrollo'
import { useDesarrollosAdmin } from '@/features/desarrollo/hooks/useDesarrollosAdmin'
import { DesarrollosTable } from '@/features/desarrollo/components/DesarrollosTable'
import { useContenidoList } from '@/features/contenido/hooks/useContenido'

const STAT_TILES = [
  { key: 'total', label: 'Total desarrollos' },
  { key: 'enVenta', label: 'En venta' },
  { key: 'preventa', label: 'Preventa' },
  { key: 'entregados', label: 'Entregados' },
] as const

export function BackofficeHomePage() {
  const { data: resumen, isLoading: cargandoResumen } = useResumenDesarrollos()
  const { data: desarrollos, isLoading: cargandoDesarrollos } = useDesarrollosAdmin({ size: 8 })
  const { data: contenido, isLoading: cargandoContenido } = useContenidoList({ size: 6 })

  return (
    <div className={bo.pageHome}>
      <div className={bo.pageHeader}>
        <div>
          <h1 className={bo.pageTitle}>Panel de control</h1>
          <p className={bo.pageSubtitle}>Resumen general de desarrollos y contenido</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <RouterLink to={ROUTES.backofficeDesarrolloNuevo} className={bo.btnOutline}>
            + Nuevo desarrollo
          </RouterLink>
          <RouterLink to={ROUTES.backofficeContenido} className={bo.btnPrimary}>
            + Nuevo contenido
          </RouterLink>
        </div>
      </div>

      {cargandoResumen ? (
        <LoadingScreen />
      ) : (
        <div className={bo.statsGrid}>
          {STAT_TILES.map((tile) => (
            <div className={bo.statTile} key={tile.key}>
              <div className={bo.statNumber}>{resumen?.[tile.key] ?? 0}</div>
              <div className={bo.statLabel}>{tile.label}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className={bo.panel}>
          <div className={bo.panelHeader}>
            <h2 className={bo.panelHeaderTitle}>Desarrollos</h2>
            <span style={{ fontSize: '0.72rem', color: '#999999' }}>{resumen?.total ?? 0} en total</span>
          </div>
          {cargandoDesarrollos ? <LoadingScreen /> : <DesarrollosTable items={desarrollos?.content ?? []} />}
        </div>

        <div className={bo.panel}>
          <div className={bo.panelHeader}>
            <h2 className={bo.panelHeaderTitle} style={{ fontSize: '1.05rem' }}>
              Contenido reciente
            </h2>
          </div>
          {cargandoContenido ? (
            <LoadingScreen />
          ) : (
            <div style={{ padding: '1.1rem 1.4rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
              {(contenido?.content ?? []).map((item) => (
                <div
                  key={item.id}
                  style={{
                    height: 52,
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.2rem',
                    overflow: 'hidden',
                  }}
                >
                  <span style={{ fontSize: '1rem', lineHeight: 1, color: '#555555' }}>{item.tipo === 'video' ? '▶' : '▨'}</span>
                  <span style={{ fontSize: '0.5rem', lineHeight: 1, color: '#eabc7b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {item.tipo}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div style={{ padding: '0 1.4rem 1.1rem' }}>
            <RouterLink to={ROUTES.backofficeContenido} style={{ fontSize: '0.7rem', color: '#eabc7b', textDecoration: 'none' }}>
              Ver toda la biblioteca →
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  )
}
