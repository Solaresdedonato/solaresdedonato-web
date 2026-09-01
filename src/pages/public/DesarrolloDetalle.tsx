import { useNavigate, useParams } from 'react-router-dom'
import { useDesarrolloPorSlug } from '@/features/desarrollo/hooks/useDesarrollo'
import { CERCANIAS_CATEGORIAS, ESTADO_LABELS } from '@/features/desarrollo/schemas/desarrollo.schema'
import { DesarrolloAccionesBotones } from '@/components/DesarrolloAccionesBotones'
import { DesarrolloGaleria } from '@/components/DesarrolloGaleria'

const CERCANIA_ICONS: Record<string, string> = {
  educacion: '🎓',
  transporte: '🚉',
  comercios: '🛒',
  salud: '⛑',
}

export function DesarrolloDetalle() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: desarrollo, isLoading } = useDesarrolloPorSlug(slug)

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#666666' }}>
          Cargando…
        </span>
      </div>
    )
  }

  if (!desarrollo) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div>
          <p style={{ color: '#f5f0e8', marginBottom: '1rem' }}>No encontramos el desarrollo que buscás.</p>
          <button type="button" className="pagina-dev-volver" onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>
      </div>
    )
  }

  // Sin zona/país, una direccion cargada como "solo calle y numero" es ambigua:
  // esa misma calle puede existir en otra localidad y Google geocodifica cualquiera.
  const mapsQuery = encodeURIComponent(`${desarrollo.direccion}, ${desarrollo.zona}, Argentina`)

  return (
    // Sin topbar propio: el "Volver" ahora vive en el <nav> del sitio (ver Navbar.tsx),
    // en el mismo lugar que ocupa el logo en el resto de las páginas — la galería queda
    // full-bleed debajo del nav, igual que el hero de Home.
    <div>
      <DesarrolloGaleria
        galeria={desarrollo.galeria}
        imagenPortadaUrl={desarrollo.imagenPortadaUrl}
        nombre={desarrollo.nombre}
        className="pagina-dev-hero"
      />

      <div className="pagina-dev-body">
        <div className="pagina-dev-info">
          <div className="modal-header-row">
            <span className={`modal-badge badge-${desarrollo.estado}`}>{ESTADO_LABELS[desarrollo.estado]}</span>
            <span className="modal-zona">{desarrollo.zona}</span>
          </div>
          <h1 className="modal-nombre">{desarrollo.nombre}</h1>
          <p className="modal-direccion">{desarrollo.direccion}</p>
          <p className="modal-descripcion">{desarrollo.descripcion}</p>

          <div className="modal-features">
            {desarrollo.features.map((f) => (
              <div className="modal-feature" key={f.clave}>
                <p className="feature-titulo">{f.titulo}</p>
                <p className="feature-texto">{f.texto}</p>
              </div>
            ))}
          </div>

          <div className="pagina-cercanias">
            <p className="cercanias-eyebrow">Cercanías</p>
            <h3 className="cercanias-titulo">
              Todo lo que tenés <em>a mano</em>
            </h3>
            <div className="cercanias-grid">
              {CERCANIAS_CATEGORIAS.map((cat) => (
                <div className="cercania-cat" key={cat.key}>
                  <div className="cercania-cat-header">
                    <span className="cercania-icono">{CERCANIA_ICONS[cat.key]}</span>
                    <span className="cercania-cat-titulo">{cat.titulo}</span>
                  </div>
                  <ul className="cercania-lista">
                    {desarrollo.cercanias[cat.key].map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-mapa">
            <div className="mapa-header">
              <div className="mapa-info">
                <p className="mapa-eyebrow">Ubicación en el mapa</p>
                <p className="mapa-direccion">{desarrollo.direccion}</p>
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
                title={`Mapa de ${desarrollo.nombre}`}
                src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed&z=15&hl=es`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <DesarrolloAccionesBotones desarrollo={desarrollo} />
        </div>
      </div>
    </div>
  )
}
