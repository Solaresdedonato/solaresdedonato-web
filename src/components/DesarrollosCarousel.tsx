import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'
import { DesarrolloCard } from './DesarrolloCard'
import { DesarrolloQuickViewModal } from './DesarrolloQuickViewModal'

const AUTOPLAY_MS = 3800

interface DesarrollosCarouselProps {
  items: Desarrollo[]
}

export function DesarrollosCarousel({ items }: DesarrollosCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [quickViewSlug, setQuickViewSlug] = useState<string | null>(null)

  const scrollToIndex = (i: number) => {
    const track = trackRef.current
    const card = track?.children[i] as HTMLElement | undefined
    if (!track || !card) return
    // scrollIntoView recorre todos los ancestros scrolleables, incluida la página —
    // por eso "saltaba" hasta el carrusel. Movemos solo el scroll horizontal del track.
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

  const quickView = items.find((d) => d.slug === quickViewSlug) ?? null
  const total = items.length

  return (
    <div className="carousel-wrap" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="carousel-track" ref={trackRef}>
        {items.map((d, i) => (
          <DesarrolloCard key={d.id} desarrollo={d} numero={String(i + 1).padStart(2, '0')} onQuickView={() => setQuickViewSlug(d.slug)} />
        ))}
      </div>

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

      {/* Portal a document.body: .modal-dev es position:fixed, y necesita posicionarse
          contra la pantalla real. Si quedara anidado acá adentro, heredaría el
          transform de .reveal (la animación de aparición al scrollear) — cualquier
          transform en un ancestro crea un containing block nuevo para los hijos
          fixed, así que el modal terminaba encerrado en la caja chica del carrusel
          en vez de ocupar toda la pantalla, y el contenido de más abajo (los 4
          botones) quedaba inalcanzable aunque scrolleara. */}
      {quickView &&
        createPortal(
          <DesarrolloQuickViewModal desarrollo={quickView} onClose={() => setQuickViewSlug(null)} />,
          document.body
        )}
    </div>
  )
}
