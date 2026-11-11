import { useEffect, useRef } from 'react'
import { useOnScroll } from '@/shared/hooks/useScrollFx'
import logoIcon from '@/assets/logo-icon.png'

const RAYOS = 48
const R_INTERNO = 74
const CX = 200
const CY = 200

/**
 * Isologo "vivo" para la sección Sobre nosotros: el sol del logo con sus rayos.
 * - Al scrollear por la sección, los rayos se van dibujando desde el centro (el sol "sale").
 * - Con el mouse encima, los rayos que apuntan hacia el cursor se alargan y se iluminan.
 * Nada gira. Con prefers-reduced-motion se muestra completo y quieto.
 */
export function LogoSolar() {
  const contRef = useRef<HTMLDivElement | null>(null)
  const rayosRef = useRef<(SVGLineElement | null)[]>([])
  const estado = useRef({ progreso: 0, angulo: null as number | null, fuerza: 0 })

  const dibujar = () => {
    const { progreso, angulo, fuerza } = estado.current
    rayosRef.current.forEach((linea, i) => {
      if (!linea) return
      const a = (i / RAYOS) * Math.PI * 2 - Math.PI / 2
      // Cada rayo aparece un poco después que el anterior (barrido en sentido horario).
      const propio = Math.min(Math.max(progreso * 1.6 - (i / RAYOS) * 0.6, 0), 1)
      const largoBase = i % 2 === 0 ? 92 : 58
      let extra = 0
      let brillo = 0
      if (angulo !== null) {
        let d = Math.abs(a - angulo) % (Math.PI * 2)
        if (d > Math.PI) d = Math.PI * 2 - d
        const cerca = Math.pow(Math.max(Math.cos(d), 0), 8) * fuerza
        extra = cerca * 34
        brillo = cerca
      }
      const r2 = R_INTERNO + (largoBase + extra) * propio
      linea.setAttribute('x2', (CX + Math.cos(a) * r2).toFixed(1))
      linea.setAttribute('y2', (CY + Math.sin(a) * r2).toFixed(1))
      linea.style.opacity = String(propio === 0 ? 0 : 0.35 + 0.65 * Math.max(propio * 0.6, brillo))
    })
  }

  useOnScroll(() => {
    const el = contRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      estado.current.progreso = 1
    } else {
      const caja = (el.closest('section') ?? el).getBoundingClientRect()
      const h = window.innerHeight
      estado.current.progreso = Math.min(Math.max((h - caja.top) / (h * 0.85), 0), 1)
    }
    dibujar()
  })

  useEffect(() => {
    const el = contRef.current
    if (!el) return
    let raf = 0
    const mover = (e: PointerEvent) => {
      const caja = el.getBoundingClientRect()
      const x = e.clientX - (caja.left + caja.width / 2)
      const y = e.clientY - (caja.top + caja.height / 2)
      estado.current.angulo = Math.atan2(y, x)
      estado.current.fuerza = 1
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(dibujar)
    }
    const salir = () => {
      estado.current.fuerza = 0
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(dibujar)
    }
    el.addEventListener('pointermove', mover)
    el.addEventListener('pointerleave', salir)
    return () => {
      el.removeEventListener('pointermove', mover)
      el.removeEventListener('pointerleave', salir)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="rd-sol" ref={contRef} aria-hidden="true">
      <svg viewBox="0 0 400 400">
        <defs>
          <radialGradient id="rd-sol-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#eabc7b" stopOpacity=".22" />
            <stop offset=".55" stopColor="#eabc7b" stopOpacity=".05" />
            <stop offset="1" stopColor="#eabc7b" stopOpacity="0" />
          </radialGradient>
          <path id="rd-sol-anillo" d="M200,200 m-182,0 a182,182 0 1,1 364,0 a182,182 0 1,1 -364,0" />
        </defs>
        <circle cx={CX} cy={CY} r="196" fill="url(#rd-sol-halo)" />
        <circle className="rd-sol-orbita" cx={CX} cy={CY} r="196" />
        <circle className="rd-sol-orbita fina" cx={CX} cy={CY} r={R_INTERNO - 8} />
        <text className="rd-sol-texto">
          <textPath href="#rd-sol-anillo" startOffset="0" textLength="1135" lengthAdjust="spacing">
            SOLARES DE DONATO · DESARROLLADORA INMOBILIARIA · CONSTRUCTORA · DESDE HACE 25 AÑOS ·
          </textPath>
        </text>
        <g className="rd-sol-rayos">
          {Array.from({ length: RAYOS }, (_, i) => {
            const a = (i / RAYOS) * Math.PI * 2 - Math.PI / 2
            const x1 = CX + Math.cos(a) * R_INTERNO
            const y1 = CY + Math.sin(a) * R_INTERNO
            return (
              <line
                key={i}
                ref={(n) => {
                  rayosRef.current[i] = n
                }}
                x1={x1.toFixed(1)}
                y1={y1.toFixed(1)}
                x2={x1.toFixed(1)}
                y2={y1.toFixed(1)}
                className={i % 2 === 0 ? 'largo' : ''}
              />
            )
          })}
        </g>
      </svg>
      <img className="rd-sol-logo" src={logoIcon} alt="" />
    </div>
  )
}
