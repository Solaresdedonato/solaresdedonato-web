import { useState } from 'react'
import bo from '@/styles/backoffice.module.css'
import { LoadingScreen } from '@/shared/components/LoadingScreen'
import { EmptyState } from '@/shared/components/EmptyState'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { useDesarrollosAdmin } from '@/features/desarrollo/hooks/useDesarrollosAdmin'
import { useContenidoList, useEliminarContenido } from '../hooks/useContenido'
import { useGuardarContenido } from '../hooks/useGuardarContenido'
import { ContenidoForm } from '../components/ContenidoForm'
import { ContenidoGrid } from '../components/ContenidoGrid'
import type { ContenidoMedia } from '../schemas/contenido.schema'

export function ContenidoPage() {
  const [aEliminar, setAEliminar] = useState<ContenidoMedia | null>(null)
  const [desarrolloFiltro, setDesarrolloFiltro] = useState<number | null>(null)
  const { data: desarrollos } = useDesarrollosAdmin({ size: 100 })
  const { data: contenido, isLoading } = useContenidoList({ desarrolloId: desarrolloFiltro ?? undefined, size: 100 })
  const { guardar, isLoading: creando, error: errorCrear } = useGuardarContenido()
  const { eliminar, isLoading: eliminando, error: errorEliminar } = useEliminarContenido()

  return (
    <div className={bo.page}>
      <div className={bo.breadcrumb}>Contenido estático / Nuevo</div>
      <h1 className={bo.pageTitle} style={{ marginBottom: '2rem' }}>
        Nuevo contenido
      </h1>

      <ContenidoForm
        desarrollos={desarrollos?.content ?? []}
        isLoading={creando}
        error={errorCrear}
        onSubmit={(values, archivo) => guardar({ form: values, archivo })}
      />

      <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: "'Titillium Web', sans-serif", fontWeight: 400, fontSize: '1.3rem', color: '#ffffff', margin: 0 }}>
            Biblioteca de contenido
          </h2>
          <select
            className={bo.select}
            style={{ width: 'auto', minWidth: 220 }}
            value={desarrolloFiltro ?? ''}
            onChange={(e) => setDesarrolloFiltro(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Todos los desarrollos</option>
            {desarrollos?.content.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>
        {isLoading ? (
          <LoadingScreen />
        ) : !contenido?.content.length ? (
          <EmptyState
            message={desarrolloFiltro ? 'Este desarrollo todavía no tiene contenido.' : 'Todavía no agregaste contenido.'}
          />
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
