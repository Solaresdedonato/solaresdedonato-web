import { beforeAll, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DesarrolloDetalle } from './DesarrolloDetalle'
import { emptyDesarrolloForm, type Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'
import type { ContenidoMedia } from '@/features/contenido/schemas/contenido.schema'

const mocks = vi.hoisted(() => ({ detalle: undefined as Desarrollo | undefined }))

vi.mock('@/features/desarrollo/hooks/useDesarrollo', () => ({
  useDesarrolloPorSlug: () => ({ data: mocks.detalle, isLoading: false }),
  useDesarrollosPublicados: () => ({ data: { content: [] } }),
}))

// jsdom no trae IntersectionObserver (lo usan el collage y el radar para animar la entrada).
beforeAll(() => {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal('IntersectionObserver', IO)
})

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
      media({ id: 3, tipo: 'video', videoUrl: 'https://www.youtube.com/watch?v=abc123XYZ' }),
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
  it('el título es la dirección y el nombre comercial queda como línea arriba', () => {
    renderDetalle(desarrollo())

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Blvd. Ameghino 349')
    expect(screen.getByText('Solares Pinamar')).toBeInTheDocument()
  })

  it('muestra el estado y la disponibilidad como etiquetas separadas', () => {
    renderDetalle(desarrollo({ estado: 'entregado', disponibilidad: 'sin-unidades' }))

    expect(screen.getByText('Entregado')).toHaveClass('rd-tag', 'badge-entregado')
    expect(screen.getByText('Sin unidades')).toHaveClass('rd-tag', 'badge-sin-unidades')
  })

  it('la portada es la imagen de la cabecera; la galería va después de la descripción y no repite la portada', () => {
    const { container } = renderDetalle(desarrollo())

    const portada = screen.getByRole('img', { name: /portada de solares pinamar/i })
    expect(portada.style.backgroundImage).toContain(PORTADA)

    const descripcion = screen.getByText('Un desarrollo frente al bosque.')
    const galeria = container.querySelector('.pagina-dev-galeria') as HTMLElement
    expect(galeria).toBeInTheDocument()
    expect(descripcion.compareDocumentPosition(galeria) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    // Collage: solo la foto que no es portada, ampliable; el video va embebido.
    expect(screen.getAllByRole('button', { name: /ampliar foto \d de/i })).toHaveLength(1)
    expect(container.querySelector('.rd-video iframe')?.getAttribute('src')).toBe('https://www.youtube.com/embed/abc123XYZ')
    expect(screen.getByText('2 fotos · 1 video')).toBeInTheDocument()
  })

  it('sin portada marcada, la cabecera usa la primera foto cargada', () => {
    renderDetalle(desarrollo({ imagenPortadaUrl: null }))

    expect(screen.getByRole('img', { name: /portada de/i }).style.backgroundImage).toContain(PORTADA)
  })

  it('si lo único cargado es la portada, no dibuja la galería (ya está en la cabecera)', () => {
    const { container } = renderDetalle(desarrollo({ galeria: [media({ id: 1, archivoUrl: PORTADA, esPortada: true })] }))

    expect(container.querySelector('.pagina-dev-galeria')).not.toBeInTheDocument()
  })

  it('nombre, dirección y cercanías se muestran sin los guiones cargados como separador', () => {
    const { container } = renderDetalle(
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

    // En "Salud" el lugar y su ubicación se separan en nombre + detalle, sin la raya.
    fireEvent.click(screen.getByRole('tab', { name: /salud y esparcimiento/i }))
    expect(screen.getByText('Farmacia Belén')).toBeInTheDocument()
    expect(screen.getByText('Av. Rivadavia 9626')).toBeInTheDocument()
    expect(container.querySelector('.rd-near-list')?.textContent).not.toMatch(/[—–]/)
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

  it('el radar ubica un punto por cada lugar cargado', () => {
    const { container } = renderDetalle(
      desarrollo({ cercanias: { educacion: ['Colegio — a 0,5 km', 'Jardín'], transporte: ['Subte — 6 min a pie'], comercios: [], salud: [] } }),
    )

    expect(container.querySelectorAll('.rd-radar .dot')).toHaveLength(3)
  })

  it('el mapa lleva el pin con el logo y el click abre la dirección en Google Maps', () => {
    const { container } = renderDetalle(desarrollo())

    const link = screen.getByRole('link', { name: /ver blvd\. ameghino 349 en google maps/i })
    expect(link.getAttribute('href')).toMatch(/^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/)
    expect(link.querySelector('.rd-map-pin img')).toBeInTheDocument()
    expect(container.querySelector('.rd-map-arch iframe')).toHaveAttribute('tabindex', '-1')
  })

  it('sin fotos ni video no dibuja la galería', () => {
    const { container } = renderDetalle(desarrollo({ imagenPortadaUrl: null, galeria: [] }))

    expect(container.querySelector('.pagina-dev-galeria')).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: /portada de/i }).style.backgroundImage).toBe('')
  })

  it('la primera oración de la descripción va destacada y el resto queda igual', () => {
    renderDetalle(
      desarrollo({
        descripcion:
          'Ubicado en Av. Rivadavia 9956, CABA, este desarrollo tiene 9 pisos. Con unidades de 1 y 2 ambientes.\n\nSegundo párrafo.',
      }),
    )

    expect(screen.getByText('Ubicado en Av. Rivadavia 9956, CABA, este desarrollo tiene 9 pisos.')).toHaveClass('rd-lead')
    expect(screen.getByText('Con unidades de 1 y 2 ambientes.')).toBeInTheDocument()
    expect(screen.getByText('Segundo párrafo.')).toBeInTheDocument()
  })
})
