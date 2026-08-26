import { useEffect, useState } from 'react'
import { Link as RouterLink, matchPath, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/router/routes'
import logo from '@/assets/logo.png'

const LINKS = [
  { href: '#nosotros', label: 'Sobre nosotros' },
  { href: '#desarrollos', label: 'Nuestros desarrollos' },
  { href: '#invertir', label: 'Invertí con nosotros' },
  { href: '#brokers', label: 'Brokers' },
  { href: '#contacto', label: 'Contacto' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
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
          <img src={logo} alt="Solares de Donato — Desarrolladora" className="logo-img" />
        </RouterLink>
      )}
      <ul className="nav-links">
        {LINKS.map((link) => (
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
