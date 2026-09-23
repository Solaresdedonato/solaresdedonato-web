import { Link as RouterLink } from 'react-router-dom'
import { ROUTES } from '@/shared/router/routes'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import { ESTADO_LABELS, type Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'

interface DesarrolloCardProps {
  desarrollo: Desarrollo
  numero: string
}

/**
 * Card del carrusel de la landing. Toda la card es un link a la página de detalle
 * (antes abría un modal de vista rápida, que se eliminó): el "Ver desarrollo →" de
 * abajo es solo un remate visual, no un link aparte — anidar <a> dentro de <a> es
 * HTML inválido.
 */
export function DesarrolloCard({ desarrollo, numero }: DesarrolloCardProps) {
  const estadoModifier = desarrollo.estado === 'entregado' ? 'entregado' : desarrollo.estado === 'preventa' ? 'preventa' : ''

  return (
    <RouterLink to={ROUTES.desarrolloDetalle(desarrollo.slug)} className="carousel-card">
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
          <span className="ver-mas">Ver desarrollo →</span>
        </div>
      </div>
    </RouterLink>
  )
}
