import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { mediaUrl } from '@/shared/utils/mediaUrl'

interface DesarrolloLightboxProps {
  fotos: string[]
  index: number
  nombre: string
  onIndexChange: (index: number) => void
  onClose: () => void
}

const SWIPE_MIN_PX = 50

/**
 * Carrusel a pantalla completa de las fotos de un desarrollo (se abre al hacer clic en
 * una foto de la galería). Se cierra con la cruz, clic en el fondo o Escape; navega con
 * los botones, las flechas del teclado o deslizando en pantallas táctiles.
 */
export function DesarrolloLightbox({ fotos, index, nombre, onIndexChange, onClose }: DesarrolloLightboxProps) {
  const touchStartX = useRef<number | null>(null)

  const hayVarias = fotos.length > 1
  const prev = (index - 1 + fotos.length) % fotos.length
  const next = (index + 1) % fotos.length

  // Escape/flechas + bloqueo del scroll de la página mientras está abierto. El foco vuelve
  // al elemento que lo abrió al cerrar.
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (hayVarias && e.key === 'ArrowLeft') onIndexChange(prev)
      else if (hayVarias && e.key === 'ArrowRight') onIndexChange(next)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hayVarias, prev, next, onIndexChange, onClose])

  const onTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current
    touchStartX.current = null
    if (startX === null || !hayVarias) return
    const dx = e.changedTouches[0].clientX - startX
    if (dx > SWIPE_MIN_PX) onIndexChange(prev)
    else if (dx < -SWIPE_MIN_PX) onIndexChange(next)
  }

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${nombre}`}
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
    >
      <div className="lightbox-backdrop" onClick={onClose} />

      <img className="lightbox-img" src={mediaUrl(fotos[index])} alt={`Foto ${index + 1} de ${nombre}`} />

      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Cerrar" autoFocus>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {hayVarias && (
        <>
          <button type="button" className="galeria-nav lightbox-prev" onClick={() => onIndexChange(prev)} aria-label="Anterior">
            ‹
          </button>
          <button type="button" className="galeria-nav lightbox-next" onClick={() => onIndexChange(next)} aria-label="Siguiente">
            ›
          </button>
          <span className="lightbox-contador">
            {index + 1} / {fotos.length}
          </span>
        </>
      )}
    </div>,
    document.body,
  )
}
