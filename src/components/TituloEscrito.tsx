import { useRef } from 'react'
import { useOnScroll } from '@/shared/hooks/useScrollFx'

interface Tramo {
  texto: string
  /** Se muestra en dorado/itálica (como <em> en el resto de los títulos). */
  destacado?: boolean
}

interface TituloEscritoProps {
  tramos: Tramo[]
  className?: string
}

/**
 * Título que "se va escribiendo" a medida que se baja: las letras aparecen según cuánto
 * subió el título en la pantalla (empieza al asomar por abajo y termina al llegar a la
 * mitad). Todas las letras ocupan su lugar desde el principio (solo cambian de opacidad),
 * así el texto no salta. Con "reducir movimiento" se muestra completo.
 */
export function TituloEscrito({ tramos, className }: TituloEscritoProps) {
  const ref = useRef<HTMLHeadingElement | null>(null)
  const texto = tramos.map((t) => t.texto).join('')

  useOnScroll(() => {
    const el = ref.current
    if (!el) return
    const letras = el.querySelectorAll<HTMLElement>('.rd-escribe-c')
    const total = letras.length
    let visibles = total
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const inicio = vh * 0.95 // el título asoma por abajo
      const fin = vh * 0.5 // el título llega a la mitad de la pantalla
      const progreso = Math.min(1, Math.max(0, (inicio - r.top) / (inicio - fin)))
      visibles = Math.round(progreso * total)
    }
    letras.forEach((l, i) => {
      l.classList.toggle('on', i < visibles)
      l.classList.toggle('ult', i === visibles - 1 && visibles < total)
    })
  })

  let i = 0
  return (
    <h2 className={className} ref={ref} aria-label={texto}>
      {tramos.map((t, k) => {
        const letras = [...t.texto].map((c) => (
          <span key={i++} className="rd-escribe-c" aria-hidden="true">
            {c}
          </span>
        ))
        return t.destacado ? <em key={k}>{letras}</em> : <span key={k}>{letras}</span>
      })}
    </h2>
  )
}
