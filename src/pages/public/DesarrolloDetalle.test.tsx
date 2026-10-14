import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DesarrolloDetalle } from './DesarrolloDetalle'
import { emptyDesarrolloForm, type Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'
import type { ContenidoMedia } from '@/features/contenido/schemas/contenido.schema'

const mocks = vi.hoisted(() => ({ detalle: undefined as Desarrollo | undefined }))

vi.mock('@/features/desarrollo/hooks/useDesarrollo', () => ({
  useDesarrolloPorSlug: () => ({ data: mocks.detalle, isLoading: false }),
}))

const media = (over: Partial<ContenidoMedia>): ContenidoMedia => ({
  id: 1,
  desarrolloId: 1,
  tipo: 'foto',
  titulo: 'titulo',
  categoria: 'fachada',
  descripcion: null,
  archivoUrl: null,
  videoUrl: null,
  esPortada: false,
  orden: 0,
  ...over,
})

const PORTADA = 'https://img.test/portada.jpg'

function desarrollo(over: Partial<Desarrollo> = {}): Desarrollo {
  return {
    ...emptyDesarrolloForm(),
    id: 1,
    slug: 'solares-pinamar',
    nombre: 'Solares Pinamar',
    zona: 'Pinamar Norte',
    direccion: 'Blvd. Ameghino 349',
    descripcion: 'Un desarrollo frente al bosque.',
    publicado: true,
    imagenPortadaUrl: PORTADA,
    galeria: [
      media({ id: 1, archivoUrl: PORTADA, esPortada: true }),
      media({ id: 2, archivoUrl: 'https://img.test/b.jpg' }),
      media({ id: 3, tipo: 'video', videoUrl: 'https://www.youtube.com/watch?v=abc' }),
    ],
    ...over,
  }
}

function renderDetalle(d: Desarrollo) {
  mocks.detalle = d
  return render(
    <MemoryRouter initialEntries={['/desarrollos/solares-pinamar']}>
      <Routes>
        <Route path="/desarrollos/:slug" element={<DesarrolloDetalle />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DesarrolloDetalle', () => {
  it('el título es la dirección y no se repite la dirección como línea chica debajo', () => {
    const { container } = renderDetalle(desarrollo())

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Blvd. Ameghino 349')
    expect(container.querySelector('.modal-direccion')).not.toBeInTheDocument()
    // El nombre comercial no se pierde: queda como etiqueta en la fila del estado.
    expect(screen.getByText('Solares Pinamar')).toBeInTheDocument()
  })

  it('la fila de arriba muestra el estado y la disponibilidad como badges separados', () => {
    renderDetalle(desarrollo({ estado: 'entregado', disponibilidad: 'sin-unidades' }))

    expect(screen.getByText('Entregado')).toHaveClass('modal-badge', 'badge-entregado')
    expect(screen.getByText('Sin unidades')).toHaveClass('modal-badge', 'badge-sin-unidades')
  })

  it('la portada es la única imagen del hero; la galería completa va después de la descripción', () => {
    const { container } = renderDetalle(desarrollo())

    const hero = screen.getByRole('img', { name: /portada de solares pinamar/i })
    expect(hero.style.backgroundImage).toContain(PORTADA)
    expect(hero.querySelector('.galeria-slides')).toBeNull()

    const descripcion = screen.getByText('Un desarrollo frente al bosque.')
    const galeria = container.querySelector('.pagina-dev-galeria') as HTMLElement
    expect(galeria).toBeInTheDocument()
    // DOCUMENT_POSITION_FOLLOWING (4): la galería está después de la descripción en el DOM.
    expect(descripcion.compareDocumentPosition(galeria) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    // Visor con el video + las 2 fotos, miniaturas para saltar entre ellos, y resumen.
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ver video de/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /ver foto \d de/i })).toHaveLength(2)
    expect(screen.getByText('2 fotos · 1 video')).toBeInTheDocument()
  })

  it('sin portada marcada, el hero usa la primera foto cargada', () => {
    renderDetalle(desarrollo({ imagenPortadaUrl: null }))

    const hero = screen.getByRole('img', { name: /portada de/i })
    expect(hero.style.backgroundImage).toContain(PORTADA)
  })

  it('si lo único cargado es la portada, no dibuja la galería (ya está en el hero)', () => {
    const { container } = renderDetalle(desarrollo({ galeria: [media({ id: 1, archivoUrl: PORTADA, esPortada: true })] }))

    expect(container.querySelector('.pagina-dev-galeria')).not.toBeInTheDocument()
  })

  it('nombre, dirección y cercanías se muestran sin los guiones cargados como separador', () => {
    renderDetalle(
      desarrollo({
        nombre: 'SOLARES - VILLA LURO',
        direccion: 'Rivadavia 9954 — Villa Luro',
        cercanias: {
          educacion: [],
          transporte: ['Tren - Estación Villa Luro'],
          comercios: [],
          salud: ['Farmacia Belén — Av. Rivadavia 9626'],
        },
      }),
    )

    expect(screen.getByText('SOLARES VILLA LURO')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Rivadavia 9954, Villa Luro')
    expect(screen.getByText('Tren, Estación Villa Luro')).toBeInTheDocument()
    expect(screen.getByText('Farmacia Belén, Av. Rivadavia 9626')).toBeInTheDocument()
  })

  it('cada categoría de cercanías tiene un ícono SVG, sin emojis', () => {
    const { container } = renderDetalle(
      desarrollo({ cercanias: { educacion: ['Colegio'], transporte: ['Subte'], comercios: ['Súper'], salud: ['Hospital'] } }),
    )

    const iconos = container.querySelectorAll('.cercania-icono')
    expect(iconos).toHaveLength(4)
    iconos.forEach((icono) => {
      expect(icono.querySelector('svg')).toBeInTheDocument()
      expect(icono.textContent).toBe('')
    })
  })

  it('el mapa lleva el pin con el logo y el click abre la dirección en Google Maps', () => {
    const { container } = renderDetalle(desarrollo())

    const link = screen.getByRole('link', { name: /ver blvd\. ameghino 349 en google maps/i })
    expect(link.getAttribute('href')).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/)
    expect(link.querySelector('.mapa-marcador img')).toBeInTheDocument()
    // El iframe queda fijo (el pin está encima): fuera del orden de tabulación.
    expect(container.querySelector('.mapa-iframe-wrap iframe')).toHaveAttribute('tabindex', '-1')
  })

  it('sin fotos ni video no dibuja la galería', () => {
    const { container } = renderDetalle(desarrollo({ imagenPortadaUrl: null, galeria: [] }))

    expect(container.querySelector('.pagina-dev-galeria')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: /portada de/i }).style.backgroundImage).toBe('')
  })
})
