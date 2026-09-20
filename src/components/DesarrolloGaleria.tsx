import { useState } from 'react'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import { videoEmbedUrl } from '@/shared/utils/videoEmbedUrl'
import type { ContenidoMedia } from '@/features/contenido/schemas/contenido.schema'
import { DesarrolloLightbox } from './DesarrolloLightbox'

interface DesarrolloGaleriaProps {
  galeria?: ContenidoMedia[]
  imagenPortadaUrl: string | null
  nombre: string
  /** El wrapper que le da tamaño (.modal-video en el modal, .pagina-dev-hero en la
   *  página de detalle) — este componente solo agrega las slides + controles adentro. */
  className: string
  /** Si es true, las fotos son clickeables y abren un carrusel a pantalla completa. */
  ampliable?: boolean
}

type Slide = { kind: 'video'; url: string; id: number } | { kind: 'foto'; url: string; id: number }

/**
 * Fotos + video (si hay) del desarrollo, cargados desde la biblioteca de contenido.
 * El video, cuando existe, siempre va primero — se prioriza sobre las fotos porque
 * es el contenido de mayor impacto. Si todavía no hay nada cargado, cae a la portada
 * como única imagen.
 */
export function DesarrolloGaleria({ galeria, imagenPortadaUrl, nombre, className, ampliable = false }: DesarrolloGaleriaProps) {
  const [index, setIndex] = useState(0)
  // Posición dentro de las fotos (no de las slides: el lightbox no muestra videos).
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const videos = (galeria ?? []).filter((c) => c.tipo === 'video' && c.videoUrl)
  const fotos = (galeria ?? []).filter((c) => c.tipo === 'foto' && c.archivoUrl)

  const slides: Slide[] = [
    ...videos.map((v) => ({ kind: 'video' as const, url: v.videoUrl as string, id: v.id })),
    ...fotos.map((f) => ({ kind: 'foto' as const, url: f.archivoUrl as string, id: f.id })),
  ]

  if (slides.length === 0 && imagenPortadaUrl) {
    slides.push({ kind: 'foto', url: imagenPortadaUrl, id: -1 })
  }

  if (slides.length === 0) {
    return <div className={className} />
  }

  const fotoSlides = slides.filter((s) => s.kind === 'foto')

  const cambiarFotoAmpliada = (fotoIndex: number) => {
    setLightboxIndex(fotoIndex)
    // Al cerrar, la galería queda parada en la última foto que se estuvo viendo.
    const slideIndex = slides.findIndex((s) => s.id === fotoSlides[fotoIndex].id)
    if (slideIndex !== -1) setIndex(slideIndex)
  }

  const goPrev = () => setIndex((i) => (i - 1 + slides.length) % slides.length)
  const goNext = () => setIndex((i) => (i + 1) % slides.length)

  return (
    <div className={className}>
      <div className="galeria-slides">
        {slides.map((slide, i) => (
          <div key={slide.id} className={`galeria-slide ${i === index ? 'active' : ''}`}>
            {slide.kind === 'video' ? (
              <iframe
                className="galeria-slide-video"
                src={videoEmbedUrl(slide.url)}
                title={`Video de ${nombre}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : ampliable ? (
              <button
                type="button"
                className="galeria-slide-foto galeria-slide-foto-ampliable"
                style={{ backgroundImage: `url(${mediaUrl(slide.url)})` }}
                aria-label={`Ampliar foto de ${nombre}`}
                tabIndex={i === index ? 0 : -1}
                onClick={() => setLightboxIndex(fotoSlides.findIndex((f) => f.id === slide.id))}
              >
                <span className="galeria-ampliar" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </span>
              </button>
            ) : (
              <div
                className="galeria-slide-foto"
                style={{ backgroundImage: `url(${mediaUrl(slide.url)})` }}
                role="img"
                aria-label={`Foto de ${nombre}`}
              />
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button type="button" className="galeria-nav galeria-prev" onClick={goPrev} aria-label="Anterior">
            ‹
          </button>
          <button type="button" className="galeria-nav galeria-next" onClick={goNext} aria-label="Siguiente">
            ›
          </button>
          <div className="galeria-dots">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                className={`galeria-dot ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Ir al elemento ${i + 1}`}
              />
            ))}
          </div>
          <span className="galeria-contador">
            {index + 1} / {slides.length}
          </span>
        </>
      )}

      {lightboxIndex !== null && (
        <DesarrolloLightbox
          fotos={fotoSlides.map((f) => f.url)}
          index={lightboxIndex}
          nombre={nombre}
          onIndexChange={cambiarFotoAmpliada}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}
