import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DesarrolloQuickViewModal } from './DesarrolloQuickViewModal'
import { emptyDesarrolloForm, type Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'

// El detalle por slug (galería) no interesa acá: se ve el modal con lo que llega por props.
vi.mock('@/features/desarrollo/hooks/useDesarrollo', () => ({
  useDesarrolloPorSlug: () => ({ data: undefined }),
}))

function desarrolloConFeatures(textos: [string, string, string, string]): Desarrollo {
  const base = emptyDesarrolloForm()
  return {
    ...base,
    id: 1,
    slug: 'solares-pinamar',
    nombre: 'Solares Pinamar',
    zona: 'Pinamar',
    direccion: 'Blvd. Ameghino 349',
    descripcion: 'Descripción',
    publicado: true,
    imagenPortadaUrl: null,
    features: base.features.map((f, i) => ({ ...f, texto: textos[i] })),
  }
}

describe('DesarrolloQuickViewModal', () => {
  it('no tiene botón de cruz', () => {
    render(<DesarrolloQuickViewModal desarrollo={desarrolloConFeatures(['a', 'b', 'c', 'd'])} onClose={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /cerrar/i })).not.toBeInTheDocument()
  })

  it('se cierra con Escape', async () => {
    const onClose = vi.fn()
    render(<DesarrolloQuickViewModal desarrollo={desarrolloConFeatures(['a', 'b', 'c', 'd'])} onClose={onClose} />)

    await userEvent.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('se cierra con clic en el fondo, pero no con clic adentro del modal', async () => {
    const onClose = vi.fn()
    const { container } = render(
      <DesarrolloQuickViewModal desarrollo={desarrolloConFeatures(['a', 'b', 'c', 'd'])} onClose={onClose} />,
    )

    await userEvent.click(screen.getByRole('heading', { name: 'Solares Pinamar' }))
    expect(onClose).not.toHaveBeenCalled()

    await userEvent.click(container.querySelector('.modal-backdrop') as HTMLElement)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('no dibuja las características sin texto', () => {
    render(<DesarrolloQuickViewModal desarrollo={desarrolloConFeatures(['Vista al mar', '', '  ', ''])} onClose={vi.fn()} />)

    expect(screen.getByText('Vista al mar')).toBeInTheDocument()
    expect(screen.getByText('Ubicación')).toBeInTheDocument()
    expect(screen.queryByText('Confort')).not.toBeInTheDocument()
    expect(screen.queryByText('Accesos')).not.toBeInTheDocument()
    expect(screen.queryByText('Comercial')).not.toBeInTheDocument()
  })

  it('sin ninguna característica no dibuja el bloque', () => {
    const { container } = render(
      <DesarrolloQuickViewModal desarrollo={desarrolloConFeatures(['', '', '', ''])} onClose={vi.fn()} />,
    )
    expect(container.querySelector('.modal-features')).not.toBeInTheDocument()
  })
})
