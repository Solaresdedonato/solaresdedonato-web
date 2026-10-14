import type { ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDesarrolloPorSlug } from '@/features/desarrollo/hooks/useDesarrollo'
import {
  CERCANIAS_CATEGORIAS,
  DISPONIBILIDAD_LABELS,
  ESTADO_LABELS,
  type DesarrolloCercanias,
} from '@/features/desarrollo/schemas/desarrollo.schema'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import { sinGuiones } from '@/shared/utils/sinGuiones'
import { DesarrolloAccionesBotones } from '@/components/DesarrolloAccionesBotones'
import { DesarrolloGaleria } from '@/components/DesarrolloGaleria'
import logoIcon from '@/assets/logo-icon.png'

function IconoCercania({ children }: { children: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

const CERCANIA_ICONS: Record<keyof DesarrolloCercanias, ReactNode> = {
  educacion: (
    <IconoCercania>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </IconoCercania>
  ),
  transporte: (
    <IconoCercania>
      <rect x="4" y="3" width="16" height="16" rx="2" />
      <path d="M4 11h16M10 6h4M8 15h.01M16 15h.01M6 19v2M18 19v2M4 6 2 7M20 6l2 1" />
    </IconoCercania>
  ),
  comercios: (
    <IconoCercania>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
    </IconoCercania>
  ),
  salud: (
    <IconoCercania>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </IconoCercania>
  ),
}

function plural(n: number, singular: string, pluralForm: string) {
  return `${n} ${n === 1 ? singular : pluralForm}`
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
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
  const direccion = sinGuiones(desarrollo.direccion)

  // Solo los datos generales son obligatorios al crear un desarrollo: características y
  // cercanías pueden venir vacías, y en ese caso no se dibuja su bloque.
  const features = desarrollo.features.filter((f) => f.texto.trim())
  const cercanias = CERCANIAS_CATEGORIAS.filter((cat) => desarrollo.cercanias[cat.key].length > 0)

  // La portada del hero es la foto marcada como portada en el backoffice (el backend la
  // copia a imagenPortadaUrl). Si todavía no marcaron ninguna, se usa la primera foto
  // cargada para no dejar el hero vacío.
  const fotos = (desarrollo.galeria ?? []).filter((c) => c.tipo === 'foto' && c.archivoUrl)
  const videos = (desarrollo.galeria ?? []).filter((c) => c.tipo === 'video' && c.videoUrl)
  const portada = desarrollo.imagenPortadaUrl ?? fotos[0]?.archivoUrl ?? null

  // La galería solo se dibuja si hay algo más para ver que la portada que ya está arriba.
  const hayGaleria = videos.length > 0 || fotos.some((f) => f.archivoUrl !== portada)
  const resumenGaleria = [
    fotos.length > 0 ? plural(fotos.length, 'foto', 'fotos') : null,
    videos.length > 0 ? plural(videos.length, 'video', 'videos') : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    // Sin topbar propio: el "Volver" ahora vive en el <nav> del sitio (ver Navbar.tsx),
    // en el mismo lugar que ocupa el logo en el resto de las páginas — la portada queda
    // full-bleed debajo del nav, igual que el hero de Home.
    <div>
      <div
        className="pagina-dev-hero"
        style={portada ? { backgroundImage: `url(${mediaUrl(portada)})` } : undefined}
        role="img"
        aria-label={`Portada de ${desarrollo.nombre}`}
      />

      <div className="pagina-dev-body">
        <div className="pagina-dev-info">
          <div className="modal-header-row">
            <span className={`modal-badge badge-${desarrollo.estado}`}>{ESTADO_LABELS[desarrollo.estado]}</span>
            <span className={`modal-badge badge-${desarrollo.disponibilidad}`}>
              {DISPONIBILIDAD_LABELS[desarrollo.disponibilidad]}
            </span>
            <span className="modal-zona">{desarrollo.zona}</span>
            <span className="pagina-dev-nombre">{sinGuiones(desarrollo.nombre, ' ')}</span>
          </div>
          {/* El título es la dirección: es lo que identifica al desarrollo para quien lo
              busca. El nombre comercial queda como etiqueta chica en la fila de arriba. */}
          <h1 className="modal-nombre pagina-dev-titulo">{direccion}</h1>
          <p className="modal-descripcion">{desarrollo.descripcion}</p>

          {hayGaleria && (
            <section className="pagina-dev-galeria" aria-labelledby="pagina-dev-galeria-titulo">
              <div className="pagina-dev-galeria-header">
                <div>
                  <p className="pagina-dev-galeria-eyebrow">Galería</p>
                  <h2 className="pagina-dev-galeria-titulo" id="pagina-dev-galeria-titulo">
                    Recorré el <em>desarrollo</em>
                  </h2>
                </div>
                <p className="pagina-dev-galeria-resumen">{resumenGaleria}</p>
              </div>
              <DesarrolloGaleria
                galeria={desarrollo.galeria}
                imagenPortadaUrl={null}
                nombre={desarrollo.nombre}
                className="pagina-dev-galeria-visor"
                ampliable
                miniaturas
              />
            </section>
          )}

          {features.length > 0 && (
            <div className="modal-features">
              {features.map((f) => (
                <div className="modal-feature" key={f.clave}>
                  <p className="feature-titulo">{f.titulo}</p>
                  <p className="feature-texto">{f.texto}</p>
                </div>
              ))}
            </div>
          )}

          {cercanias.length > 0 && (
            <div className="pagina-cercanias">
              <p className="cercanias-eyebrow">Cercanías</p>
              <h3 className="cercanias-titulo">
                Todo lo que tenés <em>a mano</em>
              </h3>
              <div className="cercanias-grid">
                {cercanias.map((cat) => (
                  <div className="cercania-cat" key={cat.key}>
                    <div className="cercania-cat-header">
                      <span className="cercania-icono">{CERCANIA_ICONS[cat.key]}</span>
                      <span className="cercania-cat-titulo">{cat.titulo}</span>
                    </div>
                    <ul className="cercania-lista">
                      {desarrollo.cercanias[cat.key].map((item) => (
                        <li key={item}>{sinGuiones(item)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-mapa">
            <div className="mapa-header">
              <div className="mapa-info">
                <p className="mapa-eyebrow">Ubicación en el mapa</p>
                <p className="mapa-direccion">{direccion}</p>
              </div>
              <a className="mapa-link" href={mapsUrl} target="_blank" rel="noreferrer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Cómo llegar
              </a>
            </div>
            <div className="mapa-iframe-wrap">
              {/* El embed no deja cambiar el pin de Google: el del logo va encima (ver
                  .mapa-marcador) y el mapa queda fijo; el click lo abre en Google Maps. */}
              <iframe
                title={`Mapa de ${desarrollo.nombre}`}
                src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed&z=15&hl=es`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                tabIndex={-1}
                aria-hidden="true"
              />
              <a
                className="mapa-overlay"
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Ver ${direccion} en Google Maps`}
              >
                <span className="mapa-marcador" aria-hidden="true">
                  <span className="mapa-marcador-logo">
                    <img src={logoIcon} alt="" />
                  </span>
                </span>
              </a>
            </div>
          </div>

          <DesarrolloAccionesBotones desarrollo={desarrollo} />
        </div>
      </div>
    </div>
  )
}
