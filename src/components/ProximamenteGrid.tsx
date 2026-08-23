import { Link as RouterLink } from 'react-router-dom'
import { ROUTES } from '@/shared/router/routes'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import type { Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'

interface ProximamenteGridProps {
  items: Desarrollo[]
}

export function ProximamenteGrid({ items }: ProximamenteGridProps) {
  if (items.length === 0) return null

  return (
    <div className="proximamente-block">
      <div className="proximamente-header">
        <div>
          <p className="prox-eyebrow">Próximamente</p>
          <h3 className="prox-title">
            Nuevos <em>desarrollos</em> en camino
          </h3>
          <p className="prox-desc">
            Estos son los proyectos que se vienen. Sumate a la lista de espera para acceder a la preventa con condiciones
            preferenciales.
          </p>
        </div>
        <a href="#contacto" className="prox-cta-link">
          Sumate a la lista de espera →
        </a>
      </div>

      <div className="proximamente-grid">
        {items.map((d) => (
          <RouterLink to={ROUTES.desarrolloDetalle(d.slug)} className="prox-card" key={d.id}>
            <div className="prox-img" style={{ backgroundImage: d.imagenPortadaUrl ? `url(${mediaUrl(d.imagenPortadaUrl)})` : undefined }} />
            <div className="prox-overlay">
              <span className="prox-badge">Próximamente</span>
              <div className="prox-info">
                <p className="prox-zona">{d.zona}</p>
                <h4 className="prox-nombre">{d.nombre}</h4>
                <div className="prox-divisor" />
                <p className="prox-status">En desarrollo</p>
              </div>
            </div>
          </RouterLink>
        ))}
      </div>
    </div>
  )
}
