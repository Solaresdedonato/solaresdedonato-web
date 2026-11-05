import { useEffect, useRef, useState } from 'react'
import { Link as RouterLink, matchPath, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/router/routes'
import { useDesarrollosPublicados } from '@/features/desarrollo/hooks/useDesarrollo'
import { ordenarPorDisponibilidad } from '@/features/desarrollo/utils/ordenarPorDisponibilidad'
import type { Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'
import { sinGuiones } from '@/shared/utils/sinGuiones'
import logo from '@/assets/logo.png'
import logoIcon from '@/assets/logo-icon.png'

const LINKS_ANTES = [{ href: '#nosotros', label: 'Sobre nosotros' }]
const LINKS_DESPUES = [
  { href: '#invertir', label: 'Invertí con nosotros' },
  { href: '#brokers', label: 'Brokers' },
  { href: '#contacto', label: 'Contacto' },
]

/** Menú desplegable con los desarrollos de un estado; cada ítem abre su ficha. */
function MenuDesarrollos({ titulo, items }: { titulo: string; items: Desarrollo[] }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLLIElement | null>(null)

  // Se cierra al elegir un desarrollo, al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  if (items.length === 0) return null
  return (
    <li
      ref={ref}
      className={`rd-dd ${abierto ? 'open' : ''}`}
      onMouseEnter={() => setAbierto(true)}
      onMouseLeave={() => setAbierto(false)}
    >
      <button type="button" className="rd-dd-btn" aria-expanded={abierto} aria-haspopup="true" onClick={() => setAbierto((v) => !v)}>
        {titulo}
        <span className="rd-dd-caret" aria-hidden="true" />
      </button>
      <div className="rd-dd-panel">
        <ul>
          {items.map((d) => (
            <li key={d.slug}>
              <RouterLink to={ROUTES.desarrolloDetalle(d.slug)} onClick={() => setAbierto(false)}>
                <span className="rd-dd-nombre">{sinGuiones(d.nombre, ' ')}</span>
                <span className="rd-dd-dir">
                  {sinGuiones(d.direccion)} · {d.zona}
                </span>
              </RouterLink>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { data } = useDesarrollosPublicados()
  const desarrollos = data?.content ?? []
  const enPozo = ordenarPorDisponibilidad(desarrollos.filter((d) => d.estado === 'en-pozo'))
  const entregados = ordenarPorDisponibilidad(desarrollos.filter((d) => d.estado === 'entregado'))
  // En el detalle de un desarrollo no tiene sentido ofrecer "ir al inicio" arriba de
  // todo: mostramos "Volver" en su lugar, en la misma posición del logo.
  const enDetalleDesarrollo = !!matchPath('/desarrollos/:slug', location.pathname)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={scrolled ? 'scrolled' : ''}>
      {enDetalleDesarrollo ? (
        <button type="button" className="pagina-dev-volver" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Volver
        </button>
      ) : (
        <RouterLink to={ROUTES.home} className="nav-logo">
          {/* En anchos intermedios el isologo completo no entra sin pisar el menú — ahí se
           *  muestra solo el ícono (ver media query en original-landing.css). */}
          <img src={logo} alt="Solares de Donato — Desarrolladora" className="logo-img logo-img-full" />
          <img src={logoIcon} alt="Solares de Donato" className="logo-img logo-img-compact" />
        </RouterLink>
      )}
      <ul className="nav-links">
        {LINKS_ANTES.map((link) => (
          <li key={link.href}>
            <a href={`${ROUTES.home}${link.href}`}>{link.label}</a>
          </li>
        ))}
        <MenuDesarrollos titulo="En pozo" items={enPozo} />
        <MenuDesarrollos titulo="Entregados" items={entregados} />
        {LINKS_DESPUES.map((link) => (
          <li key={link.href}>
            <a href={`${ROUTES.home}${link.href}`}>{link.label}</a>
          </li>
        ))}
      </ul>
      <a href={`${ROUTES.home}#contacto`} className="nav-cta">
        Contacte con nosotros
      </a>
    </nav>
  )
}
