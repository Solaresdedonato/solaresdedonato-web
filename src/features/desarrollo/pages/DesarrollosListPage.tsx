import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import bo from '@/styles/backoffice.module.css'
import { ROUTES } from '@/shared/router/routes'
import { LoadingScreen } from '@/shared/components/LoadingScreen'
import { EmptyState } from '@/shared/components/EmptyState'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { useDesarrollosAdmin } from '../hooks/useDesarrollosAdmin'
import { useEliminarDesarrollo } from '../hooks/useEliminarDesarrollo'
import { DesarrollosTable } from '../components/DesarrollosTable'
import { ESTADOS_DESARROLLO, ESTADO_LABELS, type Desarrollo, type EstadoDesarrollo } from '../schemas/desarrollo.schema'

export function DesarrollosListPage() {
  const [estado, setEstado] = useState<EstadoDesarrollo | ''>('')
  const [publicado, setPublicado] = useState<'true' | 'false' | ''>('')
  const [zona, setZona] = useState('')
  const [aEliminar, setAEliminar] = useState<Desarrollo | null>(null)

  const { data, isLoading } = useDesarrollosAdmin({
    estado: estado || undefined,
    publicado: publicado === '' ? undefined : publicado === 'true',
    zona: zona || undefined,
  })
  const { eliminar, isLoading: eliminando, error: errorEliminar } = useEliminarDesarrollo()

  return (
    <div className={bo.page}>
      <div className={bo.pageHeader}>
        <h1 className={bo.pageTitle}>Desarrollos</h1>
        <RouterLink to={ROUTES.backofficeDesarrolloNuevo} className={bo.btnPrimary}>
          + Nuevo desarrollo
        </RouterLink>
      </div>

      <div className={bo.panelPadded} style={{ marginBottom: '1.5rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 180 }}>
          <label className={bo.label}>Estado</label>
          <select className={bo.select} value={estado} onChange={(e) => setEstado(e.target.value as EstadoDesarrollo | '')}>
            <option value="">Todos</option>
            {ESTADOS_DESARROLLO.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABELS[e]}
              </option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: 180 }}>
          <label className={bo.label}>Publicado</label>
          <select className={bo.select} value={publicado} onChange={(e) => setPublicado(e.target.value as 'true' | 'false' | '')}>
            <option value="">Todos</option>
            <option value="true">Publicado</option>
            <option value="false">Borrador</option>
          </select>
        </div>
        <div style={{ minWidth: 200 }}>
          <label className={bo.label}>Zona</label>
          <input className={bo.input} value={zona} onChange={(e) => setZona(e.target.value)} />
        </div>
      </div>

      <div className={bo.panel}>
        {isLoading ? (
          <LoadingScreen />
        ) : !data?.content.length ? (
          <EmptyState message="No hay desarrollos que coincidan con los filtros." />
        ) : (
          <DesarrollosTable items={data.content} onEliminar={setAEliminar} />
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!aEliminar}
        title="Eliminar desarrollo"
        message={`¿Seguro que querés eliminar "${aEliminar?.nombre}"?`}
        detail="Esta acción lo quita del listado público y del backoffice."
        loading={eliminando}
        errorMessage={errorEliminar?.message}
        onCancel={() => setAEliminar(null)}
        onConfirm={() => {
          if (aEliminar) eliminar(aEliminar.id, { onSuccess: () => setAEliminar(null) })
        }}
      />
    </div>
  )
}
