import { useEffect } from 'react'
import { useDesarrolloPorSlug } from '@/features/desarrollo/hooks/useDesarrollo'
import { ESTADO_LABELS, type Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'
import { DesarrolloAccionesBotones } from './DesarrolloAccionesBotones'
import { DesarrolloGaleria } from './DesarrolloGaleria'

interface DesarrolloQuickViewModalProps {
  desarrollo: Desarrollo
  onClose: () => void
}

export function DesarrolloQuickViewModal({ desarrollo, onClose }: DesarrolloQuickViewModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // El desarrollo que llega por props viene del listado público, que no trae galería
  // (para no engordar esa respuesta con fotos de cada card) — se pide el detalle por
  // slug acá, que es el único endpoint que la arma. Mientras carga, se ve igual el
  // resto del modal con lo que ya se tenía del listado.
  const { data: detalle } = useDesarrolloPorSlug(desarrollo.slug)
  const d = detalle ?? desarrollo

  const mapsQuery = encodeURIComponent(d.direccion)

  return (
    <div className="modal-dev open">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-container">
        {/* Wrapper sticky de altura 0: el botón absoluto adentro queda anclado al
            tope de .modal-container (que scrollea internamente, ver
            original-landing.css) en vez de scrollear con el contenido — antes,
            apenas el modal creció con el mapa y los botones nuevos, el X se iba
            con el scroll y quedaba inalcanzable. */}
        <div className="modal-close-sticky">
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <DesarrolloGaleria galeria={d.galeria} imagenPortadaUrl={d.imagenPortadaUrl} nombre={d.nombre} className="modal-video" />

        <div className="modal-info">
          <div className="modal-header-row">
            <span className={`modal-badge badge-${d.estado}`}>{ESTADO_LABELS[d.estado]}</span>
            <span className="modal-zona">{d.zona}</span>
          </div>
          <h2 className="modal-nombre">{d.nombre}</h2>
          <p className="modal-direccion">{d.direccion}</p>

          <p className="modal-descripcion">{d.descripcion}</p>

          <div className="modal-features">
            {d.features.map((f) => (
              <div className="modal-feature" key={f.clave}>
                <p className="feature-titulo">{f.titulo}</p>
                <p className="feature-texto">{f.texto}</p>
              </div>
            ))}
          </div>

          <div className="modal-mapa">
            <div className="mapa-header">
              <div className="mapa-info">
                <p className="mapa-eyebrow">Ubicación en el mapa</p>
                <p className="mapa-direccion">{d.direccion}</p>
              </div>
              <a
                className="mapa-link"
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noreferrer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Cómo llegar
              </a>
            </div>
            <div className="mapa-iframe-wrap">
              <iframe
                title={`Mapa de ${d.nombre}`}
                src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed&z=15&hl=es`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <DesarrolloAccionesBotones onSolicitarInfo={onClose} />
        </div>
      </div>
    </div>
  )
}
