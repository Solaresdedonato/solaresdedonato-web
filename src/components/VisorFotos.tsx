import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import { alFallarUsarOriginal, imagenOptima } from '@/shared/utils/imagenOptima'

interface VisorFotosProps {
  fotos: string[]
  index: number
  nombre: string
  onIndexChange: (index: number) => void
  onClose: () => void
}

const SWIPE_MIN_PX = 50

/**
 * Visor a pantalla completa de la ficha, sin flechas: se navega con la tira de
 * miniaturas de abajo, tocando la mitad izquierda/derecha de la foto, con el teclado
 * (← →) o deslizando. Se cierra con "Cerrar", clic en el fondo o Escape.
 */
export function VisorFotos({ fotos, index, nombre, onIndexChange, onClose }: VisorFotosProps) {
  const touchStartX = useRef<number | null>(null)
  const tiraRef = useRef<HTMLDivElement | null>(null)
  const hayVarias = fotos.length > 1
  const prev = (index - 1 + fotos.length) % fotos.length
  const next = (index + 1) % fotos.length

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

  // Mantiene la miniatura activa a la vista y precarga las vecinas.
  useEffect(() => {
    const miniatura = tiraRef.current?.children[index] as HTMLElement | undefined
    miniatura?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' })
    if (!hayVarias) return
    for (const i of [prev, next]) {
      const url = imagenOptima(mediaUrl(fotos[i]), 2560)
      if (url) new Image().src = url
    }
  }, [fotos, index, hayVarias, prev, next])

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
      className="rd-visor"
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${nombre}`}
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={onTouchEnd}
    >
      <div className="rd-visor-fondo" onClick={onClose} />
      <button type="button" className="rd-visor-cerrar" onClick={onClose} aria-label="Cerrar" autoFocus>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </button>

      <div className="rd-visor-escena">
        <img
          key={index}
          className="rd-visor-img"
          src={imagenOptima(mediaUrl(fotos[index]), 2560)}
          alt={`Foto ${index + 1} de ${nombre}`}
          onError={alFallarUsarOriginal(mediaUrl(fotos[index]))}
        />
        {hayVarias && (
          <>
            <button type="button" className="rd-visor-zona izq" onClick={() => onIndexChange(prev)} aria-label="Foto anterior" />
            <button type="button" className="rd-visor-zona der" onClick={() => onIndexChange(next)} aria-label="Foto siguiente" />
          </>
        )}
      </div>

      {hayVarias && (
        <div className="rd-visor-pie">
          <span className="rd-visor-cont">
            <b>{String(index + 1).padStart(2, '0')}</b> / {String(fotos.length).padStart(2, '0')}
          </span>
          <div className="rd-visor-tira" ref={tiraRef}>
            {fotos.map((f, i) => (
              <button
                key={f}
                type="button"
                className={i === index ? 'on' : ''}
                onClick={() => onIndexChange(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
              >
                <img src={imagenOptima(mediaUrl(f), 256)} alt="" loading="lazy" onError={alFallarUsarOriginal(mediaUrl(f))} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
