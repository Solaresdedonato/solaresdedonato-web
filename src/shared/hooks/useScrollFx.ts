import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'

const prefiereSinMovimiento = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Un solo listener de scroll (con rAF) que llama a `fn` en cada frame en que hubo scroll
 * o resize. `target` permite escuchar el scroll de un contenedor en vez de la ventana.
 */
export function useOnScroll(fn: () => void, target?: RefObject<HTMLElement | null>) {
  const fnRef = useRef(fn)
  useLayoutEffect(() => {
    fnRef.current = fn
  })

  useEffect(() => {
    const el: HTMLElement | Window = target?.current ?? window
    let pendiente = false
    const run = () => {
      if (pendiente) return
      pendiente = true
      requestAnimationFrame(() => {
        pendiente = false
        fnRef.current()
      })
    }
    run()
    el.addEventListener('scroll', run, { passive: true })
    window.addEventListener('resize', run)
    return () => {
      el.removeEventListener('scroll', run)
      window.removeEventListener('resize', run)
    }
  }, [target])
}

/**
 * Parallax: desplaza el elemento en Y proporcional a lo lejos que está su contenedor del
 * centro de la pantalla. `velocidad` negativa sube, positiva baja. Sin efecto con
 * prefers-reduced-motion.
 */
export function useParallax<T extends HTMLElement>(velocidad: number) {
  const ref = useRef<T | null>(null)
  useOnScroll(() => {
    const el = ref.current
    if (!el || prefiereSinMovimiento()) return
    const caja = (el.parentElement ?? el).getBoundingClientRect()
    if (caja.bottom < 0 || caja.top > window.innerHeight) return
    const centro = caja.top + caja.height / 2 - window.innerHeight / 2
    el.style.transform = `translate3d(0, ${(centro * velocidad).toFixed(1)}px, 0)`
  })
  return ref
}

/**
 * Scroll horizontal "fijado": la sección se alarga lo que mide el track y, mientras se
 * scrollea verticalmente, el track se traslada en X. En pantallas chicas (≤768px) o con
 * prefers-reduced-motion queda desactivado y el track scrollea de forma nativa.
 * Devuelve el progreso 0→1 para la barra y el contador.
 */
export function useHorizontalPin(dependencias: unknown[] = []) {
  const seccionRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [progreso, setProgreso] = useState(0)

  const activo = () => !prefiereSinMovimiento() && window.matchMedia('(min-width: 769px)').matches

  useEffect(() => {
    const ajustarAlto = () => {
      const seccion = seccionRef.current
      const track = trackRef.current
      if (!seccion || !track) return
      if (!activo()) {
        seccion.style.height = ''
        track.style.transform = ''
        return
      }
      const recorrido = Math.max(track.scrollWidth - window.innerWidth, 0)
      seccion.style.height = `${window.innerHeight + recorrido}px`
    }
    ajustarAlto()
    window.addEventListener('resize', ajustarAlto)
    // Las imágenes pueden cambiar el ancho del track cuando terminan de cargar.
    const ro = new ResizeObserver(ajustarAlto)
    if (trackRef.current) ro.observe(trackRef.current)
    return () => {
      window.removeEventListener('resize', ajustarAlto)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias)

  useOnScroll(() => {
    const seccion = seccionRef.current
    const track = trackRef.current
    if (!seccion || !track || !activo()) return
    const caja = seccion.getBoundingClientRect()
    const recorrido = Math.max(track.scrollWidth - window.innerWidth, 0)
    const total = Math.max(seccion.offsetHeight - window.innerHeight, 1)
    const p = Math.min(Math.max(-caja.top / total, 0), 1)
    track.style.transform = `translate3d(${(-p * recorrido).toFixed(1)}px, 0, 0)`
    setProgreso((prev) => (Math.abs(prev - p) > 0.002 ? p : prev))
  })

  return { seccionRef, trackRef, progreso }
}

/** true la primera vez que el elemento entra en pantalla (para animaciones de entrada). */
export function useEnVista<T extends HTMLElement>(opciones: IntersectionObserverInit = { threshold: 0.15 }) {
  const ref = useRef<T | null>(null)
  const [visto, setVisto] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || visto) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisto(true)
        io.disconnect()
      }
    }, opciones)
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visto])
  return { ref, visto }
}
