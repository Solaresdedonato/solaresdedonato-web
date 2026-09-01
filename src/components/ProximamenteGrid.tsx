import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ROUTES } from '@/shared/router/routes'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import type { Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'

const AUTOPLAY_MS = 4200

interface ProximamenteGridProps {
  items: Desarrollo[]
}

export function ProximamenteGrid({ items }: ProximamenteGridProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const scrollToIndex = (i: number) => {
    const track = trackRef.current
    const card = track?.children[i] as HTMLElement | undefined
    if (!track || !card) return
    track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
  }

  useEffect(() => {
    if (paused || items.length < 2) return
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % items.length
        scrollToIndex(next)
        return next
      })
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, items.length])

  const goPrev = () => {
    setIndex((prev) => {
      const next = Math.max(0, prev - 1)
      scrollToIndex(next)
      return next
    })
  }
  const goNext = () => {
    setIndex((prev) => {
      const next = Math.min(items.length - 1, prev + 1)
      scrollToIndex(next)
      return next
    })
  }

  if (items.length === 0) return null

  const total = items.length

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

      <div className="carousel-wrap" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="proximamente-track" ref={trackRef}>
          {items.map((d) => (
            <RouterLink to={ROUTES.desarrolloDetalle(d.slug)} className="prox-card" key={d.id}>
              <div
                className="prox-img"
                style={{ backgroundImage: d.imagenPortadaUrl ? `url(${mediaUrl(d.imagenPortadaUrl)})` : undefined }}
              />
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

        {total > 1 && (
          <div className="carousel-controls">
            <div className="carousel-nav">
              <button type="button" className="carousel-btn" onClick={goPrev} disabled={index === 0} aria-label="Anterior">
                ‹
              </button>
              <button type="button" className="carousel-btn" onClick={goNext} disabled={index === total - 1} aria-label="Siguiente">
                ›
              </button>
            </div>
            <div className="carousel-progreso">
              <div className="carousel-progreso-bar" style={{ width: `${((index + 1) / total) * 100}%` }} />
            </div>
            <div className="carousel-contador">
              <span className="actual">{String(index + 1).padStart(2, '0')}</span>/{String(total).padStart(2, '0')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
