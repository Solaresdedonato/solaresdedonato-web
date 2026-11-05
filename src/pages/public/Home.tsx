import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useDesarrollosPublicados } from '@/features/desarrollo/hooks/useDesarrollo'
import { ordenarPorDisponibilidad } from '@/features/desarrollo/utils/ordenarPorDisponibilidad'
import type { Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'
import { useHeroSlides } from '@/features/hero/hooks/useHeroSlides'
import { useReveal } from '@/shared/hooks/useReveal'
import { useHorizontalPin, useParallax } from '@/shared/hooks/useScrollFx'
import logoIcon from '@/assets/logo-icon.png'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import { sinGuiones } from '@/shared/utils/sinGuiones'
import { guardarOrigenClic, romanoDe } from '@/shared/utils/desarrolloUi'
import { useSlidesCargadas } from '@/shared/hooks/useSlidesCargadas'
import { ROUTES } from '@/shared/router/routes'
import { MetricasDestacadas } from '@/components/MetricasDestacadas'
import { QuickLeadForm } from '@/components/QuickLeadForm'
import { ContactoForm } from '@/features/contacto/components/ContactoForm'
import { BrokerForm } from '@/features/broker/components/BrokerForm'

const NOSOTROS_STATS = [
  { to: 25, prefix: '+', label: 'Años de empresa' },
  { to: 40000, prefix: '+', miles: true, label: 'M² construidos' },
  { to: 400, prefix: '+', label: 'Unidades vendidas' },
  { to: 14, suffix: '', label: 'Desarrollos realizados' },
]

const CTA_QUICK_STATS = [
  { to: 25, suffix: '', label: 'Años de trayectoria' },
  { to: 40, prefix: '+', suffix: 'k', label: 'M² construidos' },
  { to: 14, suffix: '', label: 'Desarrollos' },
]

const BROKER_BENEFICIOS = [
  { icono: '$', titulo: 'Comisiones competitivas', desc: 'Esquemas claros y pagos puntuales en USD.' },
  { icono: '◫', titulo: 'Material comercial exclusivo', desc: 'Fichas técnicas, renders, planos y videos de cada desarrollo.' },
  { icono: '◎', titulo: 'Asesor dedicado', desc: 'Un punto de contacto comercial para gestionar todas tus operaciones.' },
  { icono: '★', titulo: 'Acceso prioritario a lanzamientos', desc: 'Primeros en conocer y reservar unidades en preventa.' },
]

const WHATSAPP_HREF =
  'https://api.whatsapp.com/send?phone=5491151407693&text=Hola,%20vengo%20de%20la%20web%20y%20quiero%20m%C3%A1s%20informaci%C3%B3n'

/**
 * Contenedor de bloque. Los textos NO se animan (criterio de diseño: solo se mueven las
 * palabras que son links); `anim` activa la entrada al scrollear para tarjetas/imágenes.
 */
function Reveal({
  children,
  className = '',
  delay = 0,
  anim = false,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  anim?: boolean
  as?: 'div' | 'p' | 'span'
}) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <Tag
      ref={ref as never}
      className={`rd-rv ${anim ? 'rd-anim' : ''} ${visible ? 'in' : ''} ${className}`}
      style={{ '--d': `${delay}s` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}

function NumSeccion({ n }: { n: string }) {
  return <span className="rd-num">{n}</span>
}

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

/** Palabra del hero que va cambiando (excepción pedida a "solo se animan los links"). */
function useRotatingWord() {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setIndex((i) => (i + 1) % PALABRAS.length), 2600)
    return () => clearInterval(id)
  }, [])
  return index
}

/** Índice que avanza cada `ms` (carruseles de fondo del hero y de la banda final). */
function useSlideshow(total: number, ms = 5000) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (total < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % total), ms)
    return () => clearInterval(id)
  }, [total, ms])
  return total > 0 ? index % total : 0
}

function Portada({ d, className = '' }: { d: Desarrollo; className?: string }) {
  const src = mediaUrl(d.imagenPortadaUrl)
  if (src) return <img className={className} src={src} alt="" loading="lazy" decoding="async" />
  return (
    <div className={`rd-ph ${className}`}>
      <span>{romanoDe(d.nombre) || 'SD'}</span>
    </div>
  )
}

/** "En pozo": tarjetas grandes que avanzan en horizontal mientras se scrollea. */
function EnPozo({ items }: { items: Desarrollo[] }) {
  const { seccionRef, trackRef, progreso } = useHorizontalPin([items.length])
  const actual = Math.min(items.length, Math.floor(progreso * items.length * 0.999) + 1)
  if (items.length === 0) return null
  return (
    <section className="rd-hscroll" ref={seccionRef} aria-label="Desarrollos en pozo">
      <div className="rd-hscroll-pin">
        <div className="rd-hscroll-head">
          <h3>
            En <em>pozo</em>
          </h3>
          <div className="rd-hscroll-count">
            <b>{String(actual).padStart(2, '0')}</b> / {String(items.length).padStart(2, '0')}
          </div>
        </div>
        <div className="rd-hscroll-track" ref={trackRef}>
          {items.map((d, i) => (
            <RouterLink
              key={d.slug}
              to={ROUTES.desarrolloDetalle(d.slug)}
              className="rd-pozo-card"
              onClick={guardarOrigenClic}
            >
              <Portada d={d} />
              <div className="rd-pozo-info">
                <span className="rd-idx">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className="rd-chips">
                    <span className="rd-chip">En pozo</span>
                  </div>
                  <span className="rd-zona">{d.zona}</span>
                  <h4>{sinGuiones(d.nombre, ' ')}</h4>
                  <p className="rd-addr">{sinGuiones(d.direccion)}</p>
                  <span className="rd-more">Ver desarrollo →</span>
                </div>
                <span className="rd-go" aria-hidden="true">
                  →
                </span>
              </div>
            </RouterLink>
          ))}
        </div>
        <div className="rd-hscroll-bar">
          <div>
            <span style={{ transform: `scaleX(${progreso})` }} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Entregados({ items }: { items: Desarrollo[] }) {
  if (items.length === 0) return null
  return (
    <section className="rd-entregados" aria-label="Desarrollos entregados">
      <div className="rd-wrap">
        <div className="rd-grp-head">
          <h3 className="rd-grp-title">Entregados</h3>
        </div>
        <div className="rd-ent-grid">
          {items.map((d, i) => (
            <Reveal key={d.slug} delay={(i % 3) * 0.12} anim>
              <RouterLink to={ROUTES.desarrolloDetalle(d.slug)} className="rd-ent-card" onClick={guardarOrigenClic}>
                <div className="rd-ent-media">
                  <Portada d={d} />
                  <div className="rd-chips">
                    <span className="rd-chip">Entregado</span>
                  </div>
                </div>
                <div className="rd-ent-body">
                  <div>
                    <small>{d.zona}</small>
                    <h4>{sinGuiones(d.nombre, ' ')}</h4>
                    <p>{sinGuiones(d.direccion)}</p>
                  </div>
                  <span className="rd-go" aria-hidden="true">
                    →
                  </span>
                </div>
              </RouterLink>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}


export function Home() {
  const { data, isLoading } = useDesarrollosPublicados()
  const { data: heroSlides } = useHeroSlides()
  const palabraIdx = useRotatingWord()
  const heroImages = (heroSlides ?? []).map((s) => mediaUrl(s.archivoUrl)).filter((url): url is string => !!url)
  const heroSlideIndex = useSlideshow(heroImages.length)
  const heroSlideCargada = useSlidesCargadas(heroSlideIndex, heroImages.length)

  const heroParallax = useParallax<HTMLDivElement>(0.3)
  const nosotrosParallax = useParallax<HTMLImageElement>(-0.1)
  const bandaParallax = useParallax<HTMLDivElement>(0.25)

  const desarrollos = data?.content ?? []
  const enPozo = ordenarPorDisponibilidad(desarrollos.filter((d) => d.estado === 'en-pozo'))
  const entregados = ordenarPorDisponibilidad(desarrollos.filter((d) => d.estado === 'entregado'))

  // Fotos de apoyo: las del carrusel del hero (backoffice → Web) y, si faltan, portadas.
  const portadas = desarrollos.map((d) => mediaUrl(d.imagenPortadaUrl)).filter((u): u is string => !!u)
  const fotoNosotros = heroImages[1] ?? heroImages[0] ?? portadas[0]
  // La banda final va pasando por las portadas de los desarrollos (o las del hero si faltan).
  const fotosBanda = portadas.length > 0 ? portadas : heroImages
  const bandaIndex = useSlideshow(fotosBanda.length, 4500)
  const bandaCargada = useSlidesCargadas(bandaIndex, fotosBanda.length)

  const [revealNosotros, setRevealNosotros] = useState(false)
  const nosotrosImgWrap = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = nosotrosImgWrap.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setRevealNosotros(true), { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div className="rd">
      {/* HERO */}
      <section className="rd-hero">
        <div className="rd-hero-bg" ref={heroParallax}>
          {heroImages.map((src, i) => (
            <div
              key={src}
              className={`rd-hero-slide ${i === heroSlideIndex ? 'active' : ''}`}
              style={heroSlideCargada(i) ? { backgroundImage: `url(${src})` } : undefined}
            />
          ))}
        </div>
        <img className="rd-hero-logo" src={logoIcon} alt="" aria-hidden="true" />
        <div className="rd-wrap rd-hero-in">
          <p className="rd-eyebrow rd-hero-tag">Desarrolladora Inmobiliaria y Constructora</p>
          <h1 className="rd-hero-title">
            <span className="line">Un concepto</span>
            <span className="line">
              de vida{' '}
              <span className="rd-rotator" aria-live="polite">
                {PALABRAS.map((p, i) => (
                  <b key={p} className={i === palabraIdx ? 'on' : ''} aria-hidden={i !== palabraIdx}>
                    {p}
                  </b>
                ))}
              </span>
            </span>
          </h1>
          <p className="rd-hero-desc">
            Invertí en desarrollos premium en zonas estratégicas de CABA y Pinamar. Más de 25 años diseñando espacios donde la
            vida y el futuro se entrelazan.
          </p>
          <div className="rd-hero-actions">
            <a href="#desarrollos" className="rd-btn">
              <span>Ver desarrollos</span>
              <span className="rd-arrow">→</span>
            </a>
            <a href="#contacto" className="rd-btn ghost">
              <span>Contacte con nosotros</span>
            </a>
          </div>
        </div>
        <div className="rd-scroll-cue" aria-hidden="true">
          Explorar
          <i />
        </div>
      </section>

      {/* I. SOBRE NOSOTROS */}
      <section id="nosotros" className="rd-about">
        <div className="rd-wrap">
          <div className="rd-about-grid">
            <div ref={nosotrosImgWrap} className={`rd-about-img ${revealNosotros ? 'in' : ''}`}>
              {fotoNosotros && <img ref={nosotrosParallax} src={fotoNosotros} alt="" loading="lazy" />}
              <div className="rd-about-badge">
                <strong>25</strong>
                <small>años de empresa</small>
              </div>
            </div>
            <div className="rd-about-text">
              <Reveal>
                <NumSeccion n="I" />
                <p className="rd-eyebrow">Sobre nosotros</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="rd-h2">
                  Ubicaciones estratégicas. <em>Proyectos exclusivos.</em>
                </h2>
              </Reveal>
              <Reveal as="p" delay={0.2}>
                En <strong>Solares de Donato</strong>, cada espacio cuenta una historia, y desde hace <strong>25 años</strong>,
                nuestra misión ha sido escribirlas con pasión y dedicación. Más que construir edificios, creamos hogares
                diseñados para enriquecer vidas, combinando diseño, innovación y calidad en cada detalle.
              </Reveal>
              <Reveal as="p" delay={0.25}>
                Todo comenzó con un sueño: transformar la manera en que las personas experimentan su hogar. Desde entonces,
                hemos desarrollado proyectos que reflejan funcionalidad, estética y un compromiso inquebrantable con la
                excelencia. Cada ladrillo que colocamos es un paso hacia nuestra visión de construir entornos donde las
                familias crezcan y los recuerdos más valiosos cobren vida.
              </Reveal>
              <Reveal delay={0.3}>
                <blockquote className="rd-quote">
                  "Acompañamos a cada cliente e inversor en cada etapa del camino, ofreciendo confianza, respaldo y un enfoque
                  humano. Porque entendemos que construir es mucho más que un proceso: es una oportunidad para inspirar y
                  transformar."
                </blockquote>
              </Reveal>
              <Reveal as="p" delay={0.35}>
                En Solares de Donato, miramos al futuro con la misma pasión que nos trajo hasta aquí, comprometidos a seguir
                creando espacios que trasciendan generaciones y dejen una huella positiva en la vida de las personas.
              </Reveal>
            </div>
          </div>
          <Reveal className="rd-stats">
            <MetricasDestacadas items={NOSOTROS_STATS} variant="fila" />
          </Reveal>
        </div>
      </section>

      {/* II. CATÁLOGO */}
      <section id="desarrollos" className="rd-dev-intro">
        <div className="rd-wrap">
          <div>
            <Reveal>
              <NumSeccion n="II" />
              <p className="rd-eyebrow">Catálogo</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="rd-h2">
                Nuestros <em>desarrollos</em>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <a href="#contacto" className="rd-link">
              Consultar disponibilidad →
            </a>
          </Reveal>
        </div>
      </section>

      {!isLoading && (
        <>
          <EnPozo items={enPozo} />
          <Entregados items={entregados} />
        </>
      )}

      <div className="rd-cat-cta">
        <div className="rd-wrap">
          <Reveal as="p">Conocé nuestros desarrollos y encontrá el ideal para vos.</Reveal>
          <Reveal delay={0.1}>
            <a href="#ctaQuick" className="rd-btn">
              <span>Ver desarrollos disponibles</span>
              <span className="rd-arrow">→</span>
            </a>
          </Reveal>
        </div>
      </div>

      {/* ENCONTRÁ TU PROPIEDAD IDEAL */}
      <section className="rd-finder" id="ctaQuick">
        <div className="rd-wrap rd-finder-grid">
          <div>
            <Reveal>
              <p className="rd-eyebrow">Asesoramiento personalizado</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="rd-h2">
                Encontrá tu <em>propiedad ideal</em>
              </h2>
            </Reveal>
            <Reveal delay={0.15}>
              <h3 className="rd-finder-sub">Encontrá tu próximo hogar</h3>
            </Reveal>
            <Reveal as="p" className="rd-muted" delay={0.2}>
              Nuestro staff de ventas te ayudará a encontrar lo que mejor se adapte a tu necesidad de vivienda, o inversión.
            </Reveal>
            <Reveal as="p" className="rd-muted" delay={0.25}>
              Contanos qué buscás y un asesor especializado te contactará dentro de las próximas 24 horas con las mejores
              opciones.
            </Reveal>
            <Reveal className="rd-mini-stats" delay={0.3}>
              <MetricasDestacadas items={CTA_QUICK_STATS} variant="fila" />
            </Reveal>
          </div>
          <Reveal className="rd-form-shell" delay={0.15}>
            <QuickLeadForm />
          </Reveal>
        </div>
      </section>

      {/* III. INVERTÍ CON NOSOTROS */}
      <section id="invertir" className="rd-invest">
        <div className="rd-wrap">
          <div className="rd-invest-head">
            <div>
              <Reveal>
                <NumSeccion n="III" />
                <p className="rd-eyebrow">Invertí con nosotros</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="rd-h2">
                  Dos formas de hacer <em>crecer tu capital</em>
                </h2>
              </Reveal>
            </div>
            <Reveal as="p" className="rd-muted" delay={0.2}>
              Ofrecemos instrumentos diseñados para distintos perfiles de inversor: desde participaciones fraccionadas en
              propiedades premium, hasta renta fija mensual sin preocupaciones. Ambos respaldados por activos inmobiliarios
              reales.
            </Reveal>
          </div>
          <div className="rd-inv-grid">
            {[
              {
                n: 'I',
                tag: 'Innovador',
                titulo: 'Tokenización inmobiliaria',
                desc: 'La tokenización de inmuebles ha llegado al mercado argentino para revolucionar la manera de invertir en propiedades. Este modelo innovador permite que más personas participen en desarrollos inmobiliarios con montos accesibles y oportunidades diversificadas.',
                listaTitulo: 'Beneficios',
                lista: [
                  'Acceso a desarrollos premium con tickets accesibles',
                  'Participación fraccionada respaldada por inmuebles reales',
                  'Diversificá tu inversión entre varios proyectos',
                  'Mayor liquidez que la compra tradicional de propiedades',
                ],
                cta: { href: 'https://realestate.solaresdedonato.com.ar/', label: 'Ir a la plataforma →', externo: true },
              },
              {
                n: 'II',
                tag: 'Solares Deals',
                titulo: 'Renta fija mensual',
                desc: 'Invertí y recibí renta fija sin preocupaciones. Comprá tu departamento y obtené ingresos garantizados, sin ocuparte de nada. Nosotros gestionamos el alquiler y te aseguramos una renta fija mensual, estés donde estés.',
                listaTitulo: 'Cómo funciona',
                lista: [
                  'Renta mensual garantizada con contratos claros',
                  'Administración integral incluida (inquilinos, mantenimiento)',
                  'Ingresos pasivos sin trámites ni gastos imprevistos',
                  'Respaldo real de la propiedad a tu nombre',
                ],
                cta: { href: '#contacto', label: 'Descubrí más →', externo: false },
              },
            ].map((ins, i) => (
              <Reveal key={ins.n} delay={i * 0.15}>
                <article
                  className="rd-inv-card"
                  onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect()
                    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
                    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
                  }}
                >
                  <span className="rd-rn">{ins.n}</span>
                  <p className="rd-eyebrow">{ins.tag}</p>
                  <h3>{ins.titulo}</h3>
                  <p className="rd-inv-desc">{ins.desc}</p>
                  <p className="rd-checks-t">{ins.listaTitulo}</p>
                  <ul className="rd-checks">
                    {ins.lista.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                  <a
                    className="rd-link"
                    href={ins.cta.href}
                    {...(ins.cta.externo ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    {ins.cta.label}
                  </a>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ÁREA BROKER */}
      <section id="brokers" className="rd-brokers">
        <div className="rd-wrap rd-brk-grid">
          <div>
            <Reveal>
              <p className="rd-eyebrow">Area Broker</p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="rd-h2">
                Sumate a nuestra red de <em>brokers asociados</em>
              </h2>
            </Reveal>
            <Reveal as="p" className="rd-muted" delay={0.2}>
              Trabajamos con inmobiliarias y brokers independientes que comparten nuestro estándar de profesionalismo. Si
              tenés clientes interesados en nuestros desarrollos, esquemas de comisiones competitivos y acompañamiento
              integral en cada operación.
            </Reveal>
            <Reveal as="p" className="rd-checks-t rd-brk-t" delay={0.25}>
              Beneficios para brokers
            </Reveal>
            <ul className="rd-brk-list">
              {BROKER_BENEFICIOS.map((b, i) => (
                <li key={b.titulo}>
                  <Reveal className="rd-brk-item" delay={i * 0.1}>
                    <span className="rd-brk-ic" aria-hidden="true">
                      {b.icono}
                    </span>
                    <div>
                      <strong>{b.titulo}</strong>
                      <span>{b.desc}</span>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
          <Reveal className="rd-form-shell" delay={0.15}>
            <BrokerForm />
          </Reveal>
        </div>
      </section>

      {/* CTA CON PARALLAX */}
      <section className="rd-band">
        <div className="rd-band-bg" ref={bandaParallax}>
          {fotosBanda.map((src, i) => (
            <div
              key={src}
              className={`rd-band-slide ${i === bandaIndex ? 'active' : ''}`}
              style={bandaCargada(i) ? { backgroundImage: `url(${src})` } : undefined}
            />
          ))}
        </div>
        <div className="rd-wrap">
          <Reveal>
            <p className="rd-eyebrow">¿Querés más información?</p>
          </Reveal>
          <h2 className="rd-band-title">
            Tu próxima inversión <em>te está esperando</em>
          </h2>
          <Reveal as="p" delay={0.1}>
            ¿Estás interesado en nuestros proyectos? Contactanos para obtener más información y resolver todas tus consultas.
            Nuestro equipo está listo para asesorarte y acompañarte en cada etapa de tu inversión inmobiliaria.
          </Reveal>
          <Reveal className="rd-band-ctas" delay={0.2}>
            <a href="#contacto" className="rd-btn">
              <span>Contacte con nosotros</span>
            </a>
            <a href={WHATSAPP_HREF} target="_blank" rel="noreferrer" className="rd-btn wa">
              <span>WhatsApp directo</span>
            </a>
          </Reveal>
        </div>
      </section>

      {/* IV. CONTACTO */}
      <section id="contacto" className="rd-contact">
        <div className="rd-wrap rd-contact-grid">
          <div>
            <Reveal>
              <NumSeccion n="IV" />
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="rd-h2">
                Mantengamos el <em>contacto</em>
              </h2>
            </Reveal>
            <Reveal as="p" className="rd-muted" delay={0.2}>
              Equipo de profesionales especialistas en cada rubro, que abarca desde el desarrollo, arquitectura, financiación,
              construcción y postventa de emprendimientos inmobiliarios.
            </Reveal>
            <div className="rd-c-data">
              <Reveal as="p" className="rd-eyebrow">
                Datos de contacto
              </Reveal>
              <Reveal delay={0.1}>
                <a className="rd-c-item" href="https://api.whatsapp.com/send?phone=5491151407693" target="_blank" rel="noreferrer">
                  <small>WhatsApp / Teléfono</small>
                  <span>+54 9 11 5140 7693</span>
                </a>
              </Reveal>
              <Reveal delay={0.2}>
                <a className="rd-c-item" href="mailto:general@solaresdedonato.com.ar">
                  <small>Email</small>
                  <span>general@solaresdedonato.com.ar</span>
                </a>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="rd-c-item">
                  <small>Dirección</small>
                  <span>
                    Basualdo 455, C1440 DNA
                    <br />
                    Ciudad Autónoma de Buenos Aires
                  </span>
                </div>
              </Reveal>
            </div>
          </div>
          <Reveal className="rd-form-shell" delay={0.15}>
            <ContactoForm />
          </Reveal>
        </div>
      </section>
    </div>
  )
}
