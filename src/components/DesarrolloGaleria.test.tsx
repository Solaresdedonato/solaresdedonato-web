import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DesarrolloGaleria } from './DesarrolloGaleria'
import type { ContenidoMedia } from '@/features/contenido/schemas/contenido.schema'

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

// El video va primero en la galería; el lightbox solo recorre las 3 fotos.
const galeria = [
  media({ id: 1, tipo: 'video', videoUrl: 'https://www.youtube.com/watch?v=abc' }),
  media({ id: 2, archivoUrl: 'https://img.test/a.jpg' }),
  media({ id: 3, archivoUrl: 'https://img.test/b.jpg' }),
  media({ id: 4, archivoUrl: 'https://img.test/c.jpg' }),
]

function renderGaleria(props: { ampliable?: boolean } = {}) {
  return render(
    <DesarrolloGaleria galeria={galeria} imagenPortadaUrl={null} nombre="Solares Pinamar" className="hero" {...props} />,
  )
}

const dialog = () => screen.getByRole('dialog')

describe('DesarrolloGaleria — fotos clickeables', () => {
  it('sin `ampliable` las fotos no son clickeables (modal de vista rápida, vista previa del backoffice)', () => {
    renderGaleria()
    expect(screen.queryByRole('button', { name: /ampliar foto/i })).not.toBeInTheDocument()
    expect(screen.getAllByRole('img', { name: /foto de solares pinamar/i })).toHaveLength(3)
  })

  it('al hacer clic en una foto se abre el carrusel con esa foto', async () => {
    const user = userEvent.setup()
    renderGaleria({ ampliable: true })

    await user.click(screen.getAllByRole('button', { name: /ampliar foto/i })[0])

    expect(within(dialog()).getByText('1 / 3')).toBeInTheDocument()
    expect(within(dialog()).getByRole('img')).toHaveAttribute('src', 'https://img.test/a.jpg')
  })

  it('abre en la foto clickeada, no en la primera', async () => {
    const user = userEvent.setup()
    renderGaleria({ ampliable: true })

    await user.click(screen.getAllByRole('button', { name: /ampliar foto/i })[2])

    expect(within(dialog()).getByText('3 / 3')).toBeInTheDocument()
    expect(within(dialog()).getByRole('img')).toHaveAttribute('src', 'https://img.test/c.jpg')
  })

  it('navega con los botones y con las flechas del teclado, dando la vuelta en los extremos', async () => {
    const user = userEvent.setup()
    renderGaleria({ ampliable: true })
    await user.click(screen.getAllByRole('button', { name: /ampliar foto/i })[0])

    await user.click(within(dialog()).getByRole('button', { name: 'Siguiente' }))
    expect(within(dialog()).getByText('2 / 3')).toBeInTheDocument()

    await user.keyboard('{ArrowRight}')
    expect(within(dialog()).getByText('3 / 3')).toBeInTheDocument()

    await user.keyboard('{ArrowRight}')
    expect(within(dialog()).getByText('1 / 3')).toBeInTheDocument()

    await user.keyboard('{ArrowLeft}')
    expect(within(dialog()).getByText('3 / 3')).toBeInTheDocument()

    await user.click(within(dialog()).getByRole('button', { name: 'Anterior' }))
    expect(within(dialog()).getByText('2 / 3')).toBeInTheDocument()
  })

  it('se cierra con Escape, con la cruz y con clic en el fondo', async () => {
    const user = userEvent.setup()
    renderGaleria({ ampliable: true })
    const abrir = () => user.click(screen.getAllByRole('button', { name: /ampliar foto/i })[0])

    await abrir()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await abrir()
    await user.click(within(dialog()).getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await abrir()
    await user.click(dialog().querySelector('.lightbox-backdrop') as HTMLElement)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('bloquea el scroll de la página mientras está abierto y lo restaura al cerrar', async () => {
    const user = userEvent.setup()
    renderGaleria({ ampliable: true })

    await user.click(screen.getAllByRole('button', { name: /ampliar foto/i })[0])
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    expect(document.body.style.overflow).toBe('')
  })

  it('al cerrar, la galería queda en la última foto que se estuvo viendo', async () => {
    const user = userEvent.setup()
    renderGaleria({ ampliable: true })
    // Hero: video (1) + 3 fotos → contador "n / 4". Empieza en el video.
    expect(screen.getByText('1 / 4')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: /ampliar foto/i })[0])
    await user.keyboard('{ArrowRight}{ArrowRight}{Escape}')

    expect(screen.getByText('4 / 4')).toBeInTheDocument()
  })

  it('con una sola foto no muestra flechas ni contador', async () => {
    const user = userEvent.setup()
    render(
      <DesarrolloGaleria galeria={[]} imagenPortadaUrl="https://img.test/portada.jpg" nombre="X" className="hero" ampliable />,
    )

    await user.click(screen.getByRole('button', { name: /ampliar foto/i }))

    expect(within(dialog()).queryByRole('button', { name: 'Siguiente' })).not.toBeInTheDocument()
    expect(within(dialog()).queryByText(/\//)).not.toBeInTheDocument()
    expect(within(dialog()).getByRole('img')).toHaveAttribute('src', 'https://img.test/portada.jpg')
  })
})
