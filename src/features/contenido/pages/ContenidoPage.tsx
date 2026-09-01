import { useState } from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import bo from '@/styles/backoffice.module.css'
import { LoadingScreen } from '@/shared/components/LoadingScreen'
import { EmptyState } from '@/shared/components/EmptyState'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { ROUTES } from '@/shared/router/routes'
import { useDesarrolloAdmin } from '@/features/desarrollo/hooks/useDesarrollo'
import { useContenidoList, useEliminarContenido } from '../hooks/useContenido'
import { ContenidoForm } from '../components/ContenidoForm'
import { ContenidoGrid } from '../components/ContenidoGrid'
import type { ContenidoMedia } from '../schemas/contenido.schema'

export function ContenidoPage() {
  const { id } = useParams<{ id: string }>()
  const desarrolloId = Number(id)
  const [aEliminar, setAEliminar] = useState<ContenidoMedia | null>(null)

  const { data: desarrollo, isLoading: cargandoDesarrollo } = useDesarrolloAdmin(desarrolloId)
  const { data: contenido, isLoading } = useContenidoList({ desarrolloId, size: 100 })
  const { eliminar, isLoading: eliminando, error: errorEliminar } = useEliminarContenido()

  if (cargandoDesarrollo) return <LoadingScreen />
  if (!desarrollo) {
    return (
      <div className={bo.page}>
        <EmptyState message="No encontramos el desarrollo." />
      </div>
    )
  }

  return (
    <div className={bo.page}>
      <div className={bo.breadcrumb}>
        <RouterLink to={ROUTES.backofficeDesarrollos} style={{ color: 'inherit' }}>
          Desarrollos
        </RouterLink>{' '}
        / {desarrollo.nombre} / Contenido
      </div>
      <div className={bo.pageHeader}>
        <h1 className={bo.pageTitle}>Contenido de {desarrollo.nombre}</h1>
        <RouterLink to={ROUTES.backofficeDesarrolloEditar(desarrollo.id)} className={bo.btnGhost}>
          ← Volver al desarrollo
        </RouterLink>
      </div>

      <ContenidoForm desarrollo={desarrollo} />

      <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '2rem' }}>
        <h2 style={{ fontFamily: "'Titillium Web', sans-serif", fontWeight: 400, fontSize: '1.3rem', color: '#ffffff', margin: '0 0 1.5rem' }}>
          Fotos y videos de este desarrollo
        </h2>
        {isLoading ? (
          <LoadingScreen />
        ) : !contenido?.content.length ? (
          <EmptyState message="Este desarrollo todavía no tiene contenido." />
        ) : (
          <ContenidoGrid items={contenido.content} onEliminar={setAEliminar} />
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!aEliminar}
        title="Eliminar contenido"
        message={`¿Seguro que querés eliminar "${aEliminar?.titulo}"?`}
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
