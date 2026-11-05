import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CERCANIAS_CATEGORIAS, type DesarrolloCercanias } from '@/features/desarrollo/schemas/desarrollo.schema'
import { leerCercania } from '@/shared/utils/desarrolloUi'
import logoIcon from '@/assets/logo-icon.png'

type Clave = keyof DesarrolloCercanias

function IconoCercania({ children }: { children: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

const ICONOS: Record<Clave, ReactNode> = {
  educacion: (
    <IconoCercania>
      <path d="M21.42 10.92a1 1 0 0 0-.02-1.84L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.83l8.57 3.91a2 2 0 0 0 1.66 0z" />
      <path d="M22 10v6" />
      <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
    </IconoCercania>
  ),
  transporte: (
    <IconoCercania>
      <rect x="4" y="3" width="16" height="16" rx="2" />
      <path d="M4 11h16M12 3v8M8 15h.01M16 15h.01M8 19l-2 3M16 19l2 3" />
    </IconoCercania>
  ),
  comercios: (
    <IconoCercania>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </IconoCercania>
  ),
  salud: (
    <IconoCercania>
      <path d="M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z" />
    </IconoCercania>
  ),
}

/** Cada categoría ocupa un cuarto del radar (grados, 0 = derecha, sentido horario). */
const CUADRANTE: Record<Clave, [number, number]> = {
  educacion: [200, 290],
  transporte: [290, 380],
  comercios: [20, 110],
  salud: [110, 200],
}

interface Punto {
  clave: Clave
  i: number
  x: number
  y: number
  nombre: string
}

/**
 * Cercanías como radar: el edificio (isologo) al centro y cada lugar como un punto a su
 * distancia real. A la derecha se elige la categoría y se ve la lista; pasar el mouse
 * por un ítem enciende su punto.
 */
export function CercaniasRadar({ cercanias }: { cercanias: DesarrolloCercanias }) {
  const categorias = CERCANIAS_CATEGORIAS.filter((c) => cercanias[c.key].length > 0)
  const [activa, setActiva] = useState<Clave>(categorias[0]?.key ?? 'educacion')
  const [caliente, setCaliente] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (categorias.length === 0) return null

  const puntos: Punto[] = categorias.flatMap(({ key }) => {
    const items = cercanias[key]
    const [a0, a1] = CUADRANTE[key]
    return items.map((raw, i) => {
      const { km, nombre } = leerCercania(raw)
      const r = km == null ? 185 + (i % 3) * 22 : 45 + 245 * Math.min(km / 2.2, 1)
      const ang = ((a0 + (a1 - a0) * ((i + 0.5) / items.length)) * Math.PI) / 180
      return { clave: key, i, x: 300 + Math.cos(ang) * r, y: 300 + Math.sin(ang) * r, nombre }
    })
  })
  const puntoCaliente = puntos.find((p) => `${p.clave}-${p.i}` === caliente)

  return (
    <section ref={ref} className={`rd-near ${visible ? 'in' : ''}`} aria-labelledby="rd-near-titulo">
      <div className="rd-radar">
        <svg viewBox="0 0 600 600" aria-hidden="true">
          <defs>
            <linearGradient id="rd-sweep" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#eabc7b" stopOpacity="0" />
              <stop offset="1" stopColor="#eabc7b" stopOpacity=".35" />
            </linearGradient>
          </defs>
          <circle className="ring solid" cx="300" cy="300" r="290" />
          <circle className="ring" cx="300" cy="300" r="220" />
          <circle className="ring" cx="300" cy="300" r="150" />
          <circle className="ring" cx="300" cy="300" r="80" />
          <line className="ring" x1="10" y1="300" x2="590" y2="300" />
          <line className="ring" x1="300" y1="10" x2="300" y2="590" />
          <text className="rl" x="306" y="216">
            1 KM
          </text>
          <text className="rl" x="306" y="76">
            2 KM +
          </text>
          <path className="sweep" d="M300 300 L590 300 A290 290 0 0 0 505 95 Z" fill="url(#rd-sweep)" />
          {puntos.map((p, n) => (
            <g
              key={`${p.clave}-${p.i}`}
              className={`dot ${p.clave !== activa ? 'dim' : ''} ${caliente === `${p.clave}-${p.i}` ? 'hot' : ''}`}
              style={{ ['--dd' as string]: `${n * 70}ms` }}
              onMouseEnter={() => p.clave === activa && setCaliente(`${p.clave}-${p.i}`)}
              onMouseLeave={() => setCaliente(null)}
              onClick={() => setActiva(p.clave)}
            >
              <circle className="h" cx={p.x} cy={p.y} r="6" />
              <circle className="c" cx={p.x} cy={p.y} r="6.5" />
            </g>
          ))}
        </svg>
        <img className="rd-radar-sun" src={logoIcon} alt="" />
        {puntoCaliente && (
          <span className="rd-radar-tip" style={{ left: `${(puntoCaliente.x / 600) * 100}%`, top: `${(puntoCaliente.y / 600) * 100}%` }}>
            {puntoCaliente.nombre}
          </span>
        )}
      </div>

      <div>
        <p className="rd-kicker">Cercanías</p>
        <h3 className="rd-fx-h" id="rd-near-titulo">
          Todo lo que tenés <em>a mano</em>
        </h3>
        <div className="rd-near-cats" role="tablist" aria-label="Categorías de cercanías">
          {categorias.map((c) => (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={activa === c.key}
              className={activa === c.key ? 'on' : ''}
              onClick={() => setActiva(c.key)}
            >
              <span className="cercania-icono">{ICONOS[c.key]}</span>
              {c.titulo}
              <sup>{String(cercanias[c.key].length).padStart(2, '0')}</sup>
            </button>
          ))}
        </div>
        <ul className="rd-near-list" key={activa}>
          {cercanias[activa].map((raw, i) => {
            const { nombre, detalle, completo } = leerCercania(raw)
            return (
              <li
                key={raw}
                style={{ ['--i' as string]: i }}
                onMouseEnter={() => setCaliente(`${activa}-${i}`)}
                onMouseLeave={() => setCaliente(null)}
                aria-label={completo}
              >
                <span className="nm">{nombre}</span>
                {detalle && (
                  <>
                    <span className="ld" aria-hidden="true" />
                    <span className="mt">{detalle}</span>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
