import { useParams } from 'react-router-dom'
import bo from '@/styles/backoffice.module.css'
import { LoadingScreen } from '@/shared/components/LoadingScreen'
import { useDesarrolloAdmin } from '../hooks/useDesarrollo'
import { useGuardarDesarrollo } from '../hooks/useGuardarDesarrollo'
import { DesarrolloForm } from '../components/DesarrolloForm'

export function DesarrolloFormPage() {
  const { id } = useParams<{ id: string }>()
  const desarrolloId = id ? Number(id) : undefined
  const { data: desarrollo, isLoading } = useDesarrolloAdmin(desarrolloId)
  const { guardar, isLoading: guardando, error } = useGuardarDesarrollo()

  if (desarrolloId && isLoading) return <LoadingScreen />

  return (
    <div className={bo.page}>
      <div className={bo.breadcrumb}>Desarrollos / {desarrolloId ? 'Editar' : 'Nuevo'}</div>
      <div className={bo.pageHeader}>
        <h1 className={bo.pageTitle}>{desarrolloId ? `Editar: ${desarrollo?.nombre ?? ''}` : 'Nuevo desarrollo'}</h1>
      </div>
      <DesarrolloForm
        desarrollo={desarrollo}
        isLoading={guardando}
        error={error}
        onSubmit={(values, publicar) =>
          guardar({ form: values, publicar, existente: desarrollo ? { id: desarrollo.id, slug: desarrollo.slug } : undefined })
        }
      />
    </div>
  )
}
