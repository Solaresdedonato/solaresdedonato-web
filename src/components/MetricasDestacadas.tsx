import { useEffect, useRef, useState } from 'react'

type Metrica = {
  label: string
  /** Valor final a animar. Si se omite, se usa `numero` como texto fijo (ej. "USD"). */
  to?: number
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
const easeOutCubic = (p: number) => 1 - Math.pow(1 - p, 3)

function useEnVista<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return { ref, visible }
}

function useCountUp(activo: boolean) {
  const [t, setT] = useState(0)
  const rafRef = useRef(0)

  useEffect(() => {
    if (!activo) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setT(1)
      return
    }
    const inicio = performance.now()
    const tick = (ahora: number) => {
      const p = Math.min(1, (ahora - inicio) / DURACION_MS)
      setT(easeOutCubic(p))
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [activo])

  return t
}

function formatearValor(item: Metrica, t: number) {
  if (item.to === undefined) return item.numero ?? ''
  const valor = Math.round(item.to * t)
  const texto = item.miles ? valor.toLocaleString('es-AR') : String(valor)
  return texto + (item.suffix ?? '')
}

export function MetricasDestacadas({ items, variant = 'fila', className = '' }: MetricasDestacadasProps) {
  const { ref, visible } = useEnVista<HTMLDivElement>()
  const t = useCountUp(visible)

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
