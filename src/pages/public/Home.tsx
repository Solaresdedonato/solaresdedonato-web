import { useEffect, useState, type ReactNode } from 'react'
import { useDesarrollosPublicados } from '@/features/desarrollo/hooks/useDesarrollo'
import { useHeroSlides } from '@/features/hero/hooks/useHeroSlides'
import { useReveal } from '@/shared/hooks/useReveal'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import { DesarrollosCarousel } from '@/components/DesarrollosCarousel'
import { MetricasDestacadas } from '@/components/MetricasDestacadas'
import { ProximamenteGrid } from '@/components/ProximamenteGrid'
import { QuickLeadForm } from '@/components/QuickLeadForm'
import { ContactoForm } from '@/features/contacto/components/ContactoForm'
import { BrokerForm } from '@/features/broker/components/BrokerForm'

const PALABRAS = [
  'Diferente',
  'Exclusivo',
  'Único',
  'Excepcional',
  'Sofisticado',
  'Elegante',
  'Moderno',
  'Innovador',
  'Inspirador',
  'Vanguardista',
  'Distinguido',
  'Auténtico',
]

const HERO_STATS = [
  { to: 25, suffix: '+', label: 'Años de trayectoria' },
  { to: 30000, suffix: '+', miles: true, label: 'M² construidos en CABA' },
]

const NOSOTROS_STATS = [
  { to: 25, suffix: '+', label: 'Años de empresa' },
  { to: 30000, suffix: '+', miles: true, label: 'M² construidos' },
  { to: 500, suffix: '+', label: 'Unidades entregadas' },
  { to: 14, suffix: '', label: 'Desarrollos realizados' },
]

const CTA_QUICK_STATS = [
  { to: 25, suffix: '', label: 'Años de trayectoria' },
  { to: 30, suffix: 'k+', label: 'M² construidos' },
  { to: 14, suffix: '', label: 'Desarrollos' },
]

const BROKER_BENEFICIOS = [
  { titulo: 'Comisiones competitivas', desc: 'Esquemas claros y pagos puntuales en USD.' },
  { titulo: 'Material comercial exclusivo', desc: 'Fichas técnicas, renders, planos y videos de cada desarrollo.' },
  { titulo: 'Asesor dedicado', desc: 'Un punto de contacto comercial para gestionar todas tus operaciones.' },
  { titulo: 'Acceso prioritario a lanzamientos', desc: 'Primeros en conocer y reservar unidades en preventa.' },
]

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`reveal ${visible ? 'visible' : ''} ${className}`}>
      {children}
    </div>
  )
}

function Divisor({ numero }: { numero: string }) {
  return (
    <div className="divisor">
      <div className="divisor-linea" />
      <div className="divisor-numero">{numero}</div>
      <div className="divisor-linea" />
    </div>
  )
}

function useRotatingWord() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % PALABRAS.length), 2400)
    return () => clearInterval(id)
  }, [])
  return PALABRAS[index]
}

function useHeroSlideshow(total: number) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (total < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % total), 5000)
    return () => clearInterval(id)
  }, [total])
  return total > 0 ? index % total : 0
}

export function Home() {
  const { data, isLoading } = useDesarrollosPublicados()
  const { data: heroSlides } = useHeroSlides()
  const palabra = useRotatingWord()
  const heroImages = (heroSlides ?? []).map((s) => mediaUrl(s.archivoUrl)).filter((url): url is string => !!url)
  const heroSlideIndex = useHeroSlideshow(heroImages.length)

  const desarrollos = data?.content ?? []
  const proximos = desarrollos.filter((d) => d.estado === 'proximamente')
  const disponibles = desarrollos.filter((d) => d.estado !== 'proximamente')

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-slider">
          {heroImages.map((src, i) => (
            <div key={src} className={`hero-slide ${i === heroSlideIndex ? 'active' : ''}`} style={{ backgroundImage: `url(${src})` }} />
          ))}
        </div>
        <div className="hero-overlay-gradient" />
        <div className="hero-ornament" />
        <div className="hero-content">
          <p className="hero-eyebrow">Desarrolladora Inmobiliaria y Constructora</p>
          <h1 className="hero-title">
            Un concepto
            <br />
            de vida{' '}
            <span className="palabra-rotante">
              <span className="word" key={palabra}>
                {palabra}
              </span>
            </span>
          </h1>
          <p className="hero-desc">
            Invertí en desarrollos premium en zonas estratégicas de CABA y Pinamar. Más de 25 años diseñando espacios donde la
            vida y el futuro se entrelazan.
          </p>
          <div className="hero-actions">
            <a href="#desarrollos" className="btn-primario">
              Ver desarrollos
            </a>
            <a href="#contacto" className="btn-secundario">
              Contacte con nosotros
            </a>
          </div>
        </div>
        <div className="hero-stats">
          <MetricasDestacadas items={HERO_STATS} variant="columna" />
        </div>
        <div className="hero-scroll">
          <span>Explorar</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* SOBRE NOSOTROS */}
      <Divisor numero="I" />
      <section id="nosotros" className="nosotros">
        <Reveal className="nosotros-texto">
          <h2>
            <small
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.3em',
                color: 'var(--dorado)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.8rem',
                fontStyle: 'normal',
              }}
            >
              Sobre nosotros
            </small>
            Ubicaciones <em>estratégicas.</em>
            <br />
            Proyectos exclusivos.
          </h2>
          <p>
            En <strong>Solares de Donato</strong>, cada espacio cuenta una historia, y desde hace <strong>25 años</strong>,
            nuestra misión ha sido escribirlas con pasión y dedicación. Más que construir edificios, creamos hogares diseñados
            para enriquecer vidas, combinando diseño, innovación y calidad en cada detalle.
          </p>
          <p>
            Todo comenzó con un sueño: transformar la manera en que las personas experimentan su hogar. Desde entonces, hemos
            desarrollado proyectos que reflejan funcionalidad, estética y un compromiso inquebrantable con la excelencia. Cada
            ladrillo que colocamos es un paso hacia nuestra visión de construir entornos donde las familias crezcan y los
            recuerdos más valiosos cobren vida.
          </p>
          <blockquote className="destacado">
            "Acompañamos a cada cliente e inversor en cada etapa del camino, ofreciendo confianza, respaldo y un enfoque
            humano. Porque entendemos que construir es mucho más que un proceso: es una oportunidad para inspirar y
            transformar."
          </blockquote>
          <p>
            En Solares de Donato, miramos al futuro con la misma pasión que nos trajo hasta aquí, comprometidos a seguir
            creando espacios que trasciendan generaciones y dejen una huella positiva en la vida de las personas.
          </p>
        </Reveal>
        <div className="nosotros-stats">
          <MetricasDestacadas items={NOSOTROS_STATS} variant="columna" className="izquierda" />
        </div>
      </section>

      {/* DESARROLLOS */}
      <Divisor numero="II" />
      <section id="desarrollos" className="desarrollos">
        <Reveal className="seccion-header">
          <h2>
            <small>Catálogo</small>
            Nuestros <span>desarrollos</span>
          </h2>
          <a href="#contacto" className="link-ver">
            Consultar disponibilidad →
          </a>
        </Reveal>

        {!isLoading && (
          <Reveal>
            <DesarrollosCarousel items={disponibles} />
          </Reveal>
        )}

        <Reveal className="desarrollos-cta-bottom">
          <p style={{ fontSize: '0.95rem', color: 'var(--gris-claro)', marginBottom: '1.5rem' }}>
            Conocé nuestros desarrollos y encontrá el ideal para vos.
          </p>
          <a href="#contacto" className="btn-primario">
            Ver desarrollos disponibles
          </a>
        </Reveal>

        <Reveal>
          <ProximamenteGrid items={proximos} />
        </Reveal>
      </section>

      {/* CTA QUICK FORM (estilo Briones) */}
      <section className="cta-quick" id="ctaQuick">
        <Reveal className="section-titulo-centrado">
          <p className="titulo-centrado-eyebrow">Asesoramiento personalizado</p>
          <h2 className="titulo-centrado">
            Encontrá tu <em>propiedad ideal</em>
          </h2>
          <div className="titulo-centrado-linea" />
        </Reveal>
        <Reveal className="cta-quick-wrap">
          <div className="cta-quick-left">
            <p className="cta-quick-eyebrow">Encontrá tu próximo hogar</p>
            <h2 className="cta-quick-title">
              Nuestro staff de ventas te ayudará a encontrar lo que <em>mejor se adapte</em> a tu necesidad de vivienda, o
              inversión.
            </h2>
            <p className="cta-quick-desc">
              Contanos qué buscás y un asesor especializado te contactará dentro de las próximas 24 horas con las mejores
              opciones.
            </p>
            <MetricasDestacadas items={CTA_QUICK_STATS} variant="fila" />
          </div>
          <QuickLeadForm />
        </Reveal>
      </section>

      {/* INVERTÍ CON NOSOTROS */}
      <Divisor numero="III" />
      <section id="invertir" className="invertir">
        <Reveal className="invertir-intro">
          <p className="eyebrow">Invertí con nosotros</p>
          <h2>
            Dos formas de <em>hacer crecer</em> tu capital
          </h2>
          <p>
            Ofrecemos instrumentos diseñados para distintos perfiles de inversor: desde participaciones fraccionadas en
            propiedades premium, hasta renta fija mensual sin preocupaciones. Ambos respaldados por activos inmobiliarios
            reales.
          </p>
        </Reveal>
        <Reveal className="instrumentos-grid">
          <div className="instrumento">
            <div className="instrumento-num">I</div>
            <span className="instrumento-tag">Innovador</span>
            <h3>
              Tokenización <em>inmobiliaria</em>
            </h3>
            <p className="instrumento-desc">
              La <strong>tokenización de inmuebles</strong> ha llegado al mercado argentino para revolucionar la manera de
              invertir en propiedades. Este modelo innovador permite que más personas participen en desarrollos inmobiliarios
              con <strong>montos accesibles</strong> y oportunidades diversificadas.
            </p>
            <div className="instrumento-features">
              <p className="instrumento-features-titulo">Beneficios</p>
              <ul className="features-list">
                <li>
                  <span className="feature-check">✓</span>
                  <span>Acceso a desarrollos premium con tickets accesibles</span>
                </li>
                <li>
                  <span className="feature-check">✓</span>
                  <span>Participación fraccionada respaldada por inmuebles reales</span>
                </li>
                <li>
                  <span className="feature-check">✓</span>
                  <span>Diversificá tu inversión entre varios proyectos</span>
                </li>
                <li>
                  <span className="feature-check">✓</span>
                  <span>Mayor liquidez que la compra tradicional de propiedades</span>
                </li>
              </ul>
            </div>
            <a href="https://realestate.solaresdedonato.com.ar/" target="_blank" rel="noreferrer" className="instrumento-cta">
              Ir a la plataforma →
            </a>
          </div>

          <div className="instrumento">
            <div className="instrumento-num">II</div>
            <span className="instrumento-tag">Solares Deals</span>
            <h3>
              Renta <em>fija mensual</em>
            </h3>
            <p className="instrumento-desc">
              <strong>Invertí y recibí renta fija sin preocupaciones.</strong> Comprá tu departamento y obtené ingresos
              garantizados, sin ocuparte de nada. Nosotros gestionamos el alquiler y te aseguramos una{' '}
              <strong>renta fija mensual</strong>, estés donde estés.
            </p>
            <div className="instrumento-features">
              <p className="instrumento-features-titulo">Cómo funciona</p>
              <ul className="features-list">
                <li>
                  <span className="feature-check">✓</span>
                  <span>Renta mensual garantizada con contratos claros</span>
                </li>
                <li>
                  <span className="feature-check">✓</span>
                  <span>Administración integral incluida (inquilinos, mantenimiento)</span>
                </li>
                <li>
                  <span className="feature-check">✓</span>
                  <span>Ingresos pasivos sin trámites ni gastos imprevistos</span>
                </li>
                <li>
                  <span className="feature-check">✓</span>
                  <span>Respaldo real de la propiedad a tu nombre</span>
                </li>
              </ul>
            </div>
            <a href="#contacto" className="instrumento-cta">
              Descubrí más →
            </a>
          </div>
        </Reveal>
      </section>

      {/* AREA BROKER */}
      <section id="brokers" className="area-broker">
        <Reveal className="section-titulo-centrado">
          <p className="titulo-centrado-eyebrow">Area Broker</p>
          <h2 className="titulo-centrado">
            Sumate a nuestra red de <em>brokers asociados</em>
          </h2>
          <div className="titulo-centrado-linea" />
        </Reveal>
        <div className="broker-wrap">
          <Reveal className="broker-left">
            <p className="broker-desc broker-desc-main">
              Trabajamos con inmobiliarias y brokers independientes que comparten nuestro estándar de profesionalismo. Si
              tenés clientes interesados en nuestros desarrollos, esquemas de comisiones competitivos y acompañamiento
              integral en cada operación.
            </p>
            <div className="broker-beneficios">
              <p className="broker-beneficios-titulo">Beneficios para brokers</p>
              <ul className="broker-list">
                {BROKER_BENEFICIOS.map((b) => (
                  <li key={b.titulo}>
                    <span className="broker-check">✓</span>
                    <div>
                      <strong>{b.titulo}</strong>
                      <span>{b.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <BrokerForm />
        </div>
      </section>

      {/* CTA BAND */}
      <section className="cta-band">
        <Reveal>
          <p className="eyebrow">¿Querés más información?</p>
          <h2>
            Tu próxima inversión
            <br />
            <em>te está esperando</em>
          </h2>
          <p>
            ¿Estás interesado en nuestros proyectos? Contactanos para obtener más información y resolver todas tus consultas.
            Nuestro equipo está listo para asesorarte y acompañarte en cada etapa de tu inversión inmobiliaria.
          </p>
          <div className="cta-doble">
            <a href="#contacto" className="btn-primario">
              Contacte con nosotros
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=5491151407693&text=Hola,%20vengo%20de%20la%20web%20y%20quiero%20m%C3%A1s%20informaci%C3%B3n"
              target="_blank"
              rel="noreferrer"
              className="btn-secundario"
            >
              WhatsApp directo
            </a>
          </div>
        </Reveal>
      </section>

      {/* CONTACTO */}
      <Divisor numero="IV" />
      <section id="contacto" className="formulario-wrap">
        <Reveal className="contacto-encabezado">
          <h2 className="form-titulo">
            Mantengamos el <em>contacto</em>
          </h2>
          <p className="form-desc">
            Equipo de profesionales especialistas en cada rubro, que abarca desde el desarrollo, arquitectura, financiación,
            construcción y postventa de emprendimientos inmobiliarios.
          </p>
        </Reveal>
        <Reveal className="contacto-info">
          <div className="contacto-directo">
            <h4>Datos de contacto</h4>
            <a className="contacto-item" href="https://api.whatsapp.com/send?phone=5491151407693" target="_blank" rel="noreferrer">
              <span className="label">WhatsApp / Teléfono</span>
              <span className="valor">+54 9 11 5140 7693</span>
            </a>
            <a className="contacto-item" href="mailto:general@solaresdedonato.com.ar">
              <span className="label">Email</span>
              <span className="valor">general@solaresdedonato.com.ar</span>
            </a>
            <div className="contacto-item">
              <span className="label">Dirección</span>
              <span className="valor">
                Basualdo 455, C1440 DNA
                <br />
                Ciudad Autónoma de Buenos Aires
              </span>
            </div>
          </div>
        </Reveal>
        <Reveal className="contacto-formulario">
          <ContactoForm />
        </Reveal>
      </section>
    </>
  )
}
