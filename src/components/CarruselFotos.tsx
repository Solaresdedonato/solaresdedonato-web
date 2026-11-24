import { useEffect, useRef, useState } from 'react'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import { alFallarUsarOriginal, imagenOptima } from '@/shared/utils/imagenOptima'

interface CarruselFotosProps {
  fotos: string[]
  nombre: string
  /** Abre el visor a pantalla completa en esa foto. */
  onAmpliar: (index: number) => void
}

const SWIPE_MIN_PX = 50

/**
 * Carrusel de la ficha: una foto grande a la vez, entera (sin recortes), con flechas,
 * contador y tira de miniaturas. Se navega también con el teclado (← →) o deslizando.
 * Al tocar la foto se abre el visor a pantalla completa.
 */
export function CarruselFotos({ fotos, nombre, onAmpliar }: CarruselFotosProps) {
  const [index, setIndex] = useState(0)
  const tiraRef = useRef<HTMLDivElement | null>(null)
  const touchStartX = useRef<number | null>(null)
  const total = fotos.length
  const hayVarias = total > 1

  const ir = (i: number) => setIndex(((i % total) + total) % total)

  // La miniatura activa se mantiene a la vista moviendo solo la tira (no la página).
  useEffect(() => {
    const tira = tiraRef.current
    const activa = tira?.children[index] as HTMLElement | undefined
    if (!tira || !activa) return
    tira.scrollTo({ left: activa.offsetLeft - (tira.clientWidth - activa.clientWidth) / 2, behavior: 'smooth' })
  }, [index])

  if (total === 0) return null

  const src = (u: string, ancho: 640 | 1920) => imagenOptima(mediaUrl(u), ancho) ?? mediaUrl(u)
  const cercanas = new Set([index, (index + 1) % total, (index - 1 + total) % total])

  return (
    <div
      className="rd-carrusel"
      tabIndex={0}
      aria-roledescription="carrusel"
      aria-label={`Fotos de ${nombre}`}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') ir(index + 1)
        if (e.key === 'ArrowLeft') ir(index - 1)
      }}
    >
      <div
        className="rd-car-stage"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          touchStartX.current = null
          if (Math.abs(dx) >= SWIPE_MIN_PX) ir(dx < 0 ? index + 1 : index - 1)
        }}
      >
        {fotos.map((u, i) =>
          // Solo se montan la foto actual y sus vecinas: carga rápida aunque haya muchas fotos.
          cercanas.has(i) ? (
            <button
              key={u}
              type="button"
              className={`rd-car-slide${i === index ? ' activa' : ''}`}
              onClick={() => onAmpliar(i)}
              tabIndex={i === index ? 0 : -1}
              aria-hidden={i !== index}
              aria-label={`Ampliar foto ${i + 1} de ${total}`}
            >
              <img src={src(u, 1920)} alt="" decoding="async" onError={alFallarUsarOriginal(mediaUrl(u))} />
            </button>
          ) : null,
        )}

        {hayVarias && (
          <>
            <button type="button" className="rd-car-flecha prev" onClick={() => ir(index - 1)} aria-label="Foto anterior">
              ←
            </button>
            <button type="button" className="rd-car-flecha next" onClick={() => ir(index + 1)} aria-label="Foto siguiente">
              →
            </button>
          </>
        )}
        <span className="rd-car-contador" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      {hayVarias && (
        <div className="rd-car-tira" ref={tiraRef}>
          {fotos.map((u, i) => (
            <button
              key={u}
              type="button"
              className={`rd-car-mini${i === index ? ' activa' : ''}`}
              onClick={() => ir(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index}
            >
              <img src={src(u, 640)} alt="" loading="lazy" decoding="async" onError={alFallarUsarOriginal(mediaUrl(u))} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
