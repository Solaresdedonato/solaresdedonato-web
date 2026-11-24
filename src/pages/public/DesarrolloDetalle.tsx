import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { useDesarrolloPorSlug, useDesarrollosPublicados } from '@/features/desarrollo/hooks/useDesarrollo'
import { ESTADO_LABELS } from '@/features/desarrollo/schemas/desarrollo.schema'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import { alFallarUsarOriginal, imagenOptima, useImagenOptima } from '@/shared/utils/imagenOptima'
import { sinGuiones } from '@/shared/utils/sinGuiones'
import { esVideoServidoPorApi, videoEmbedUrl } from '@/shared/utils/videoEmbedUrl'
import { useOnScroll } from '@/shared/hooks/useScrollFx'
import { ROUTES } from '@/shared/router/routes'
import { VisorFotos } from '@/components/VisorFotos'
import { CercaniasRadar } from '@/components/CercaniasRadar'
import { guardarOrigenClic, separarEntrada, suavizar, tomarOrigenClic } from '@/shared/utils/desarrolloUi'
import logoIcon from '@/assets/logo-icon.png'
import { WHATSAPP_URL } from '@/shared/utils/whatsapp'

/** Formas arquitectónicas del collage, en este orden: lámina, arco, círculo, vano, arco, píldora. */
const FORMAS = ['slab', 'arch', 'circle', 'plain', 'arch', 'pill']

const entre = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Lugares anchos del collage (lámina, vano, píldora); los otros (arcos y círculo) son angostos. */
const LUGAR_ANCHO = [true, false, false, true, false, true]

/**
 * Reparte las fotos: las verticales van a los lugares angostos (arcos) y las horizontales a los
 * anchos. Solo reordena cuando ya se conocen todas las proporciones, para no mover fotos a la vista.
 */
function ordenarParaCollage(urls: string[], proporciones: Record<string, number>): string[] {
  if (urls.some((u) => !proporciones[u])) return urls
  const verticales = urls.filter((u) => proporciones[u] < 0.9)
  const horizontales = urls.filter((u) => proporciones[u] >= 0.9)
  return urls.map((_, k) => {
    const ancho = LUGAR_ANCHO[k % LUGAR_ANCHO.length]
    const elegida = ancho ? horizontales.shift() ?? verticales.shift() : verticales.shift() ?? horizontales.shift()
    return elegida as string
  })
}

/**
 * Marco de cada foto del collage. La posición y el ritmo los da el lugar (k), pero la forma y la
 * proporción se ajustan a la foto real: casi todas son horizontales, y meterlas en un arco vertical
 * o en un círculo recortaba más de la mitad de la imagen. Así el recorte queda chico y la foto se lee.
 * `r` = ancho / alto de la foto (undefined mientras no se conoce: se usa el marco original).
 */
function marcoDeFoto(k: number, r: number | undefined, total: number): { forma: string; ratio?: number } {
  const base = FORMAS[k % FORMAS.length]
  if (!r) return { forma: base }
  if (total === 1) return { forma: 'plain', ratio: entre(r, 1.2, 2) }
  // Vertical: arco en un lugar angosto; si cae en uno ancho (no había otro lugar), vano casi cuadrado.
  if (r < 0.9) return LUGAR_ANCHO[k % LUGAR_ANCHO.length] ? { forma: 'plain', ratio: entre(r, 0.95, 1.2) } : { forma: 'arch', ratio: entre(r, 0.55, 0.9) }
  if (r < 1.15) return base === 'circle' || base === 'arch' ? { forma: 'circle', ratio: 1 } : { forma: 'plain', ratio: r }
  switch (base) {
    case 'slab':
      return { forma: 'slab', ratio: entre(r, 1.3, 1.8) }
    case 'arch':
      return { forma: 'arch-soft', ratio: entre(r, 1.2, 1.5) }
    case 'circle':
      return { forma: 'oval', ratio: entre(r, 1.2, 1.5) }
    case 'pill':
      return r >= 1.45 ? { forma: 'pill', ratio: entre(r, 1.6, 2) } : { forma: 'plain', ratio: r }
    default:
      return { forma: 'plain', ratio: entre(r, 1.3, 1.8) }
  }
}

/** Foto de portada de la ficha como fondo, optimizada a 2560px (o la original si falla). */
function PortadaFondo({ url, nombre }: { url: string | undefined; nombre: string }) {
  const fondo = useImagenOptima(url, 2560)
  return (
    <div
      className="rd-cover-img"
      style={fondo ? { backgroundImage: `url("${fondo}")` } : undefined}
      role="img"
      aria-label={`Portada de ${nombre}`}
    />
  )
}

/** Animación de entrada: un círculo que crece desde el punto donde se hizo clic en la
 *  card. Si se entró directo por URL (sin clic previo) la ficha se muestra sin animar. */
function useAperturaCircular() {
  const [origen] = useState(tomarOrigenClic)
  const [fase, setFase] = useState<'cerrada' | 'abriendo' | 'lista'>(origen ? 'cerrada' : 'lista')
  useEffect(() => {
    if (!origen) return
    let id2 = 0
    // El círculo se mide sobre toda la ficha (miles de px de alto): al terminar la
    // animación se quita el recorte, si no taparía todo lo que queda más abajo.
    let fin = 0
    const id = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => {
        setFase('abriendo')
        fin = window.setTimeout(() => setFase('lista'), 1150)
      })
    })
    return () => {
      cancelAnimationFrame(id)
      cancelAnimationFrame(id2)
      clearTimeout(fin)
    }
  }, [origen])
  // El origen se guarda en coordenadas de la pantalla; la ficha arranca en el tope
  // de la página, así que coinciden con las del elemento.
  const style = {
    '--ox': origen ? `${origen[0]}px` : '50%',
    '--oy': origen ? `${origen[1]}px` : '30%',
  } as CSSProperties
  return { clase: fase === 'cerrada' ? '' : fase === 'abriendo' ? 'open' : 'open lista', style }
}

/** Se vuelve a montar al cambiar de desarrollo (key=slug), así cada ficha anima su apertura. */
export function DesarrolloDetalle() {
  const { slug } = useParams<{ slug: string }>()
  return <Ficha key={slug} slug={slug} />
}

function Ficha({ slug }: { slug: string | undefined }) {
  const navigate = useNavigate()
  const { data: desarrollo, isLoading } = useDesarrolloPorSlug(slug)
  const { data: lista } = useDesarrollosPublicados()
  const { clase: claseApertura, style: estiloApertura } = useAperturaCircular()
  const [fotoAbierta, setFotoAbierta] = useState<number | null>(null)
  const progresoRef = useRef<HTMLSpanElement | null>(null)
  const collageRef = useRef<HTMLDivElement | null>(null)
  // Proporción real (ancho / alto) de cada foto del collage, para elegirle el marco.
  const [proporciones, setProporciones] = useState<Record<string, number>>({})
  const anotarProporcion = (u: string, img: HTMLImageElement) => {
    if (!img.naturalWidth || !img.naturalHeight) return
    const r = img.naturalWidth / img.naturalHeight
    setProporciones((prev) => (prev[u] ? prev : { ...prev, [u]: r }))
  }

  useOnScroll(() => {
    const el = progresoRef.current
    if (!el) return
    const max = document.documentElement.scrollHeight - window.innerHeight
    el.style.transform = `scaleY(${max > 0 ? window.scrollY / max : 0})`
  })

  // Las fotos del collage suben a medida que entran en pantalla.
  useEffect(() => {
    const cont = collageRef.current
    if (!cont) return
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            // Atributo (no clase): React reescribe className cuando cambia el marco y borraría 'in'.
            e.target.setAttribute('data-in', '')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12 },
    )
    cont.querySelectorAll('.rd-shot').forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [desarrollo])

  // Se miden las fotos del collage apenas abre la ficha (versión chica), así cuando el usuario
  // llega a la galería cada foto ya tiene su marco y no hay saltos.
  useEffect(() => {
    if (!desarrollo) return
    const portadaUrl = desarrollo.imagenPortadaUrl
    const urls = (desarrollo.galeria ?? [])
      .filter((c) => c.tipo === 'foto' && c.archivoUrl && c.archivoUrl !== portadaUrl)
      .map((c) => c.archivoUrl as string)
    let vivo = true
    urls.forEach((u) => {
      const img = new Image()
      img.onload = () => {
        if (vivo) anotarProporcion(u, img)
      }
      const src = imagenOptima(mediaUrl(u), 640) ?? mediaUrl(u)
      if (src) img.src = src
    })
    return () => {
      vivo = false
    }
  }, [desarrollo])

  if (isLoading) {
    return (
      <div className="rd-loading">
        <span>Cargando…</span>
      </div>
    )
  }

  if (!desarrollo) {
    return (
      <div className="rd-loading">
        <div>
          <p>No encontramos el desarrollo que buscás.</p>
          <button type="button" className="rd-link" onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>
      </div>
    )
  }

  // Sin zona/país, una dirección "solo calle y número" es ambigua para Google.
  const mapsQuery = encodeURIComponent(`${desarrollo.direccion}, ${desarrollo.zona}, Argentina`)
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
  const direccion = sinGuiones(desarrollo.direccion)
  const nombre = sinGuiones(desarrollo.nombre, ' ')

  const fotos = (desarrollo.galeria ?? []).filter((c) => c.tipo === 'foto' && c.archivoUrl)
  const videos = (desarrollo.galeria ?? []).filter((c) => c.tipo === 'video' && c.videoUrl)
  const portada = desarrollo.imagenPortadaUrl ?? fotos[0]?.archivoUrl ?? null
  // El collage muestra lo que no está ya en la portada.
  const fotosCollage = ordenarParaCollage(
    fotos.map((f) => f.archivoUrl as string).filter((u) => u !== portada),
    proporciones,
  )
  const hayGaleria = fotosCollage.length > 0 || videos.length > 0
  const resumenGaleria = [
    fotos.length > 0 ? `${fotos.length} ${fotos.length === 1 ? 'foto' : 'fotos'}` : null,
    videos.length > 0 ? `${videos.length} ${videos.length === 1 ? 'video' : 'videos'}` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const { entrada, resto } = separarEntrada(desarrollo.descripcion)
  const features = desarrollo.features.filter((f) => f.texto.trim())
  const confort = features.find((f) => f.clave === 'confort')
  const otrasFeatures = features.filter((f) => f !== confort)
  const amenities = confort ? confort.texto.split(/\s*(?:,|\by\b)\s*/i).map(suavizar).filter(Boolean) : []

  const whatsapp = WHATSAPP_URL
  const enlaces = [
    desarrollo.showroomVirtualUrl && { titulo: 'Showroom virtual', sub: 'Recorré la unidad en 360°', href: desarrollo.showroomVirtualUrl },
    desarrollo.brochurePlanosUrl && { titulo: 'Brochure / Planos', sub: 'Descargar material comercial', href: desarrollo.brochurePlanosUrl },
    desarrollo.avanceObraUrl && { titulo: 'Avance de obra', sub: 'Ver fotos actualizadas', href: desarrollo.avanceObraUrl },
  ].filter((e): e is { titulo: string; sub: string; href: string } => !!e)

  const publicados = lista?.content ?? []
  const idx = publicados.findIndex((d) => d.slug === desarrollo.slug)
  const siguiente = publicados.length > 1 ? publicados[(idx + 1) % publicados.length] : null

  return (
    <article className={`rd rd-ficha ${claseApertura}`} style={estiloApertura}>
      <div className="rd-fx-prog" aria-hidden="true">
        <span ref={progresoRef} />
      </div>

      {/* PORTADA */}
      <header className="rd-cover">
        <PortadaFondo url={mediaUrl(portada)} nombre={desarrollo.nombre} />
        <div className="rd-cover-in">
          <img className="rd-cover-logo" src={logoIcon} alt="" aria-hidden="true" />
          <div className="rd-tags">
            <span className={`rd-tag badge-${desarrollo.estado}`}>{ESTADO_LABELS[desarrollo.estado]}</span>
            {desarrollo.instrumentoRentaFija && <span className="rd-tag">Renta fija</span>}
            {desarrollo.instrumentoTokenizacion && <span className="rd-tag">Tokenización</span>}
          </div>
          <p className="rd-cover-nombre">{nombre}</p>
          {/* El título es la dirección: es lo que identifica al desarrollo para quien lo busca. */}
          <h1 className="rd-cover-title">
            <span>{direccion}</span>
          </h1>
          <p className="rd-cover-zona">{desarrollo.zona}</p>
        </div>
        <div className="rd-cover-down" aria-hidden="true">
          Descubrí el proyecto
        </div>
      </header>

      {/* RELATO */}
      <section className="rd-story">
        <div>
          <p className="rd-kicker">El proyecto</p>
          <p className="rd-lead">{entrada}</p>
        </div>
        <div className="rd-body">
          {resto.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {features.length > 0 && (
          <div className="rd-amen">
            {amenities.length > 0 && (
              <>
                <p className="rd-kicker">Amenities y confort</p>
                <p className="rd-amen-list">
                  {amenities.map((a, i) => (
                    <span key={a}>
                      {i > 0 && <i aria-hidden="true">✦</i>}
                      <span>{a}</span>
                    </span>
                  ))}
                </p>
              </>
            )}
            {otrasFeatures.length > 0 && (
              <div className="rd-facts">
                {otrasFeatures.map((f) => (
                  <div key={f.clave}>
                    <small>{f.titulo}</small>
                    <span>{suavizar(f.texto)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* GALERÍA */}
      {hayGaleria && (
        <section className="rd-gal pagina-dev-galeria" aria-labelledby="rd-gal-titulo">
          <div className="rd-gal-head">
            <h2 className="rd-fx-h" id="rd-gal-titulo">
              Recorré <em>el desarrollo</em>
            </h2>
            <p>{resumenGaleria}</p>
          </div>
          <div className="rd-collage" ref={collageRef}>
            {fotosCollage.map((u, k) => {
              const marco = marcoDeFoto(k, proporciones[u], fotosCollage.length)
              return (
              <button
                key={u}
                type="button"
                className={`rd-shot ${marco.forma}`}
                style={marco.ratio ? { aspectRatio: String(marco.ratio) } : undefined}
                onClick={() => setFotoAbierta(k)}
                aria-label={`Ampliar foto ${k + 1} de ${desarrollo.nombre}`}
              >
                <img
                  onLoad={(e) => anotarProporcion(u, e.currentTarget)}
                  src={imagenOptima(mediaUrl(u), 1080)}
                  srcSet={
                    imagenOptima(mediaUrl(u), 1080) !== mediaUrl(u)
                      ? `${imagenOptima(mediaUrl(u), 640)} 640w, ${imagenOptima(mediaUrl(u), 1080)} 1080w, ${imagenOptima(mediaUrl(u), 1920)} 1920w`
                      : undefined
                  }
                  sizes="(max-width: 900px) 92vw, 50vw"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={alFallarUsarOriginal(mediaUrl(u))}
                />
                <span className="rd-shot-cap">Ampliar</span>
              </button>
              )
            })}
          </div>
          {videos.length > 0 && (
            <div className="rd-videos">
              {videos.map((v) => {
                const url = v.videoUrl as string
                return (
                  <div className="rd-video" key={v.id}>
                    {esVideoServidoPorApi(url) ? (
                      <video src={mediaUrl(url)} controls preload="metadata" title={`Video de ${desarrollo.nombre}`} />
                    ) : (
                      <iframe
                        src={videoEmbedUrl(url)}
                        title={`Video de ${desarrollo.nombre}`}
                        loading="lazy"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}
      {fotoAbierta !== null && (
        <VisorFotos
          fotos={fotosCollage}
          index={fotoAbierta}
          nombre={desarrollo.nombre}
          onIndexChange={setFotoAbierta}
          onClose={() => setFotoAbierta(null)}
        />
      )}

      {/* CERCANÍAS */}
      <CercaniasRadar cercanias={desarrollo.cercanias} />

      {/* UBICACIÓN Y MATERIAL */}
      <section className="rd-place">
        {/* Mapa idéntico al de la web actual (mismas clases y estilos de original-landing.css). */}
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
            <a className="mapa-overlay" href={mapsUrl} target="_blank" rel="noreferrer" aria-label={`Ver ${direccion} en Google Maps`}>
              <span className="mapa-marcador" aria-hidden="true">
                <span className="mapa-marcador-logo">
                  <img src={logoIcon} alt="" />
                </span>
              </span>
            </a>
          </div>
        </div>
        <div>
          <ul className="rd-links">
            {enlaces.map((e) => (
              <li key={e.titulo}>
                <a href={e.href} target="_blank" rel="noreferrer">
                  <b>{e.titulo}</b>
                  <small>{e.sub} ↗</small>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {siguiente && siguiente.slug !== desarrollo.slug && (
        <RouterLink to={ROUTES.desarrolloDetalle(siguiente.slug)} className="rd-next" onClick={guardarOrigenClic}>
          <small>Siguiente desarrollo</small>
          <strong>{sinGuiones(siguiente.nombre, ' ')}</strong>
        </RouterLink>
      )}

      <a className="rd-fx-wa" href={whatsapp} target="_blank" rel="noreferrer">
        <span>Solicitar información</span>
        <i aria-hidden="true">→</i>
      </a>
    </article>
  )
}
