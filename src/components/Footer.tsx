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
function IconTwitter() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
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
            <a href="https://twitter.com/solaresdedonato" target="_blank" rel="noreferrer" aria-label="Twitter / X">
              <IconTwitter />
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
          <a href={`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
            +54 9 11 5140 7693
          </a>
          <a href="mailto:general@solaresdedonato.com.ar">general@solaresdedonato.com.ar</a>
          <p>
            Basualdo 455, C1440 DNA
            <br />
            CABA, Argentina
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
