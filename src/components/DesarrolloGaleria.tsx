import { useState } from 'react'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import { videoEmbedUrl } from '@/shared/utils/videoEmbedUrl'
import type { ContenidoMedia } from '@/features/contenido/schemas/contenido.schema'

interface DesarrolloGaleriaProps {
  galeria?: ContenidoMedia[]
  imagenPortadaUrl: string | null
  nombre: string
  /** El wrapper que le da tamaño (.modal-video en el modal, .pagina-dev-hero en la
   *  página de detalle) — este componente solo agrega las slides + controles adentro. */
  className: string
}

type Slide = { kind: 'video'; url: string; id: number } | { kind: 'foto'; url: string; id: number }

/**
 * Fotos + video (si hay) del desarrollo, cargados desde la biblioteca de contenido.
 * El video, cuando existe, siempre va primero — se prioriza sobre las fotos porque
 * es el contenido de mayor impacto. Si todavía no hay nada cargado, cae a la portada
 * como única imagen.
 */
export function DesarrolloGaleria({ galeria, imagenPortadaUrl, nombre, className }: DesarrolloGaleriaProps) {
  const [index, setIndex] = useState(0)

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
    </div>
  )
}
