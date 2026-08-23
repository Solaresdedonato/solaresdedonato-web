import { Link as RouterLink } from 'react-router-dom'
import { ROUTES } from '@/shared/router/routes'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import { ESTADO_LABELS, type Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'

interface DesarrolloCardProps {
  desarrollo: Desarrollo
  numero: string
  onQuickView: () => void
}

export function DesarrolloCard({ desarrollo, numero, onQuickView }: DesarrolloCardProps) {
  const estadoModifier = desarrollo.estado === 'entregado' ? 'entregado' : desarrollo.estado === 'preventa' ? 'preventa' : ''

  return (
    <div className="carousel-card" onClick={onQuickView} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onQuickView()}>
      <div
        className="img-placeholder"
        style={{ backgroundImage: desarrollo.imagenPortadaUrl ? `url(${mediaUrl(desarrollo.imagenPortadaUrl)})` : undefined }}
      />
      <div className="card-overlay">
        <div className="card-top">
          <span className="card-numero">{numero}</span>
          <span className={`card-estado ${estadoModifier}`}>{ESTADO_LABELS[desarrollo.estado]}</span>
        </div>
        <div className="card-info">
          <p className="zona">{desarrollo.zona}</p>
          <h3 className="nombre">{desarrollo.nombre}</h3>
          <p className="direccion">{desarrollo.direccion}</p>
          <RouterLink to={ROUTES.desarrolloDetalle(desarrollo.slug)} className="ver-mas" onClick={(e) => e.stopPropagation()}>
            Ver desarrollo →
          </RouterLink>
        </div>
      </div>
    </div>
  )
}
