import { useEffect, useRef, useState } from 'react'

type Metrica = {
  label: string
  /** Valor final a animar. Si se omite, se usa `numero` como texto fijo (ej. "USD"). */
  to?: number
  /** Va delante del número (ej. "+" → "+25"). */
  prefix?: string
  suffix?: string
  /** Formatea el entero con separador de miles ('es-AR', ej. 30.000). */
  miles?: boolean
  numero?: string
}

type MetricasDestacadasProps = {
  items: Metrica[]
  variant?: 'fila' | 'columna'
  className?: string
}

const DURACION_MS = 1600
/** Fracción del bloque que tiene que verse para que arranque el contador. */
const UMBRAL_VISIBLE = 0.35
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3)

/**
 * Progreso (0 → 1) del contador. Arranca cuando el bloque entra en pantalla y vuelve a 0
 * cuando sale del todo, así cada vez que se lo vuelve a ver cuenta de nuevo (el reset pasa
 * fuera de pantalla, no se ve el salto a 0).
 */
function useContadorEnVista<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [t, setT] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let contando = false

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          cancelAnimationFrame(raf)
          contando = false
          setT(0)
          return
        }
        if (contando || entry.intersectionRatio < UMBRAL_VISIBLE) return
        contando = true
        if (sinAnimacion) {
          setT(1)
          return
        }
        const inicio = performance.now()
        const tick = (ahora: number) => {
          const p = Math.min(1, (ahora - inicio) / DURACION_MS)
          setT(easeOutCubic(p))
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: [0, UMBRAL_VISIBLE] },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return { ref, t }
}

function formatearValor(item: Metrica, t: number) {
  if (item.to === undefined) return item.numero ?? ''
  const valor = Math.round(item.to * t)
  const texto = item.miles ? valor.toLocaleString('es-AR') : String(valor)
  return (item.prefix ?? '') + texto + (item.suffix ?? '')
}

export function MetricasDestacadas({ items, variant = 'fila', className = '' }: MetricasDestacadasProps) {
  const { ref, t } = useContadorEnVista<HTMLDivElement>()

  return (
    <div ref={ref} className={`metricas metricas--${variant} ${className}`}>
      {items.map((item) => (
        <div className="metrica" key={item.label}>
          <span className="metrica-numero">{formatearValor(item, t)}</span>
          <span className="metrica-regla" aria-hidden="true" />
          <span className="metrica-label">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
