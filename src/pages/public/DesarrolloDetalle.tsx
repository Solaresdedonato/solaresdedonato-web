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
import { guardarOrigenClic, romanoDe, separarEntrada, suavizar, tomarOrigenClic } from '@/shared/utils/desarrolloUi'
import logoIcon from '@/assets/logo-icon.png'

const WHATSAPP_NUMBER = '5491151407693'

/** Formas arquitectónicas del collage, en este orden: lámina, arco, círculo, vano, arco, píldora. */
const FORMAS = ['slab', 'arch', 'circle', 'plain', 'arch', 'pill']

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
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        }),
      { threshold: 0.12 },
    )
    cont.querySelectorAll('.rd-shot').forEach((s) => io.observe(s))
    return () => io.disconnect()
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
  const fotosCollage = fotos.map((f) => f.archivoUrl as string).filter((u) => u !== portada)
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

  const urlDesarrollo = `${window.location.origin}/desarrollos/${desarrollo.slug}`
  const whatsapp = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(
    `Hola, quiero más información sobre ${desarrollo.nombre}. ${urlDesarrollo}`,
  )}`
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
        <div className="rd-cover-num" aria-hidden="true">
          {romanoDe(desarrollo.nombre)}
        </div>
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
            {fotosCollage.map((u, k) => (
              <button
                key={u}
                type="button"
                className={`rd-shot ${FORMAS[k % FORMAS.length]}`}
                onClick={() => setFotoAbierta(k)}
                aria-label={`Ampliar foto ${k + 1} de ${desarrollo.nombre}`}
              >
                <img
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
            ))}
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
