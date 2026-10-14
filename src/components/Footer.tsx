import { ROUTES } from '@/shared/router/routes'
import logo from '@/assets/logo.png'

const WHATSAPP_NUMBER = '5491151407693'

function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
function IconLinkedin() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="8" y1="10" x2="8" y2="17" />
      <line x1="8" y1="7" x2="8" y2="7" />
      <path d="M12 17v-4a2 2 0 0 1 4 0v4" />
    </svg>
  )
}
function IconFacebook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M15 4h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}
function IconTelefono() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
function IconEmail() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polyline points="22 6 12 13 2 6" />
    </svg>
  )
}
function IconUbicacion() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-col">
          <img src={logo} alt="Solares de Donato — Desarrolladora" className="footer-logo" />
          <p>
            Equipo de profesionales especialistas en cada rubro, que abarca desde el desarrollo, arquitectura, financiación,
            construcción y postventa de emprendimientos inmobiliarios.
          </p>
          <div className="footer-redes">
            <a href="https://www.instagram.com/solaresdedonato/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <IconInstagram />
            </a>
            <a href="https://www.linkedin.com/company/solares-de-donato/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <IconLinkedin />
            </a>
            <a href="https://www.facebook.com/solaresdedonato" target="_blank" rel="noreferrer" aria-label="Facebook">
              <IconFacebook />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h5>Menú</h5>
          <a href={ROUTES.home}>Inicio</a>
          <a href={`${ROUTES.home}#nosotros`}>Quiénes Somos</a>
          <a href={`${ROUTES.home}#desarrollos`}>Nuestros desarrollos</a>
          <a href={`${ROUTES.home}#contacto`}>Contacto</a>
        </div>

        <div className="footer-col">
          <h5>Invertir</h5>
          <a href="https://realestate.solaresdedonato.com.ar/" target="_blank" rel="noreferrer">
            Tokenización
          </a>
          <a href={`${ROUTES.home}#invertir`}>Renta Fija</a>
          <a href={`${ROUTES.home}#desarrollos`}>Desarrollos</a>
          <a href={`${ROUTES.home}#brokers`}>Area Broker</a>
        </div>

        <div className="footer-col">
          <h5>Contacto</h5>
          <a
            className="footer-contacto"
            href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
          >
            <IconTelefono />
            <span>+54 9 11 5140 7693</span>
          </a>
          <a className="footer-contacto" href="mailto:general@solaresdedonato.com.ar">
            <IconEmail />
            <span>general@solaresdedonato.com.ar</span>
          </a>
          <p className="footer-contacto">
            <IconUbicacion />
            <span>
              Basualdo 455, C1440 DNA
              <br />
              CABA, Argentina
            </span>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>® 2026 Solares de Donato. Todos los derechos reservados.</p>
        <p>Desarrolladora Inmobiliaria y Constructora</p>
      </div>
    </footer>
  )
}
