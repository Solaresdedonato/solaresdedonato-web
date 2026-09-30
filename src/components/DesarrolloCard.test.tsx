import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DesarrolloCard } from './DesarrolloCard'
import { emptyDesarrolloForm, type Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'

const desarrollo: Desarrollo = {
  ...emptyDesarrolloForm(),
  id: 1,
  slug: 'solares-pinamar',
  nombre: 'Solares Pinamar',
  zona: 'Pinamar',
  direccion: 'Blvd. Ameghino 349',
  descripcion: 'Descripción',
  publicado: true,
  imagenPortadaUrl: null,
}

describe('DesarrolloCard', () => {
  it('toda la card es un único link a la página de detalle (ya no abre un modal)', () => {
    render(
      <MemoryRouter>
        <DesarrolloCard desarrollo={desarrollo} numero="01" />
      </MemoryRouter>,
    )

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/desarrollos/solares-pinamar')
    expect(links[0]).toHaveTextContent('Solares Pinamar')
    expect(links[0]).toHaveTextContent('Ver desarrollo')
  })

  it('el badge muestra la etiqueta pública del estado, no el código del backoffice', () => {
    const { rerender } = render(
      <MemoryRouter>
        <DesarrolloCard desarrollo={{ ...desarrollo, estado: 'en-pozo' }} numero="01" />
      </MemoryRouter>,
    )
    expect(screen.getByText('Con unidades disponibles')).toHaveClass('card-estado')
    expect(screen.getByText('Con unidades disponibles')).not.toHaveClass('entregado')

    rerender(
      <MemoryRouter>
        <DesarrolloCard desarrollo={{ ...desarrollo, estado: 'entregado' }} numero="01" />
      </MemoryRouter>,
    )
    expect(screen.getByText('Sin unidades disponibles')).toHaveClass('card-estado', 'entregado')
  })
})
