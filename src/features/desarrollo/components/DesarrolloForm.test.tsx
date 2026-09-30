import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { DesarrolloForm } from './DesarrolloForm'
import { emptyDesarrolloForm, type Desarrollo } from '../schemas/desarrollo.schema'
import type { ContenidoMedia } from '@/features/contenido/schemas/contenido.schema'

const useContenidoList = vi.fn()
vi.mock('@/features/contenido/hooks/useContenido', () => ({
  useContenidoList: (...args: unknown[]) => useContenidoList(...args),
}))

const foto = (id: number, url: string): ContenidoMedia => ({
  id,
  desarrolloId: 1,
  tipo: 'foto',
  titulo: `foto ${id}`,
  categoria: 'fachada',
  descripcion: null,
  archivoUrl: url,
  videoUrl: null,
  esPortada: false,
  orden: id,
})

function desarrolloExistente(over: Partial<Desarrollo> = {}): Desarrollo {
  return {
    ...emptyDesarrolloForm(),
    id: 1,
    slug: 'solares-pinamar',
    nombre: 'Solares Pinamar',
    zona: 'Pinamar',
    direccion: 'Blvd. Ameghino 349',
    descripcion: 'Descripción',
    publicado: false,
    imagenPortadaUrl: null,
    ...over,
  }
}

function renderForm(props: Partial<React.ComponentProps<typeof DesarrolloForm>> = {}) {
  const onSubmit = vi.fn()
  const { unmount } = render(
    <MemoryRouter>
      <DesarrolloForm onSubmit={onSubmit} {...props} />
    </MemoryRouter>,
  )
  return { onSubmit, unmount }
}

async function completarDatosGenerales(user: ReturnType<typeof userEvent.setup>, omitir?: 'descripcion') {
  await user.type(screen.getByPlaceholderText('Ej: Solares Pinamar'), 'Solares Test')
  await user.type(screen.getByPlaceholderText('Ej: Pinamar, Buenos Aires'), 'Pinamar')
  await user.type(screen.getByPlaceholderText('Ej: Blvd. Ameghino 349'), 'Av. Bunge 100')
  if (omitir !== 'descripcion') {
    await user.type(screen.getByPlaceholderText(/descripción del desarrollo/i), 'Un gran desarrollo')
  }
}

beforeEach(() => {
  useContenidoList.mockReset()
  useContenidoList.mockReturnValue({ data: undefined, isLoading: false })
  // La preferencia "vista previa plegada" vive en localStorage y jsdom la conserva
  // entre tests del mismo archivo: cada test arranca con la vista previa visible.
  localStorage.clear()
})

describe('DesarrolloForm — alta con solo datos generales', () => {
  it('guarda un borrador completando solo los datos generales', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await completarDatosGenerales(user)
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const [values, publicar] = onSubmit.mock.calls[0]
    expect(publicar).toBe(false)
    expect(values).toMatchObject({
      nombre: 'Solares Test',
      zona: 'Pinamar',
      direccion: 'Av. Bunge 100',
      estado: 'en-pozo',
      disponibilidad: 'unidades-disponibles',
    })
    // Las 4 características viajan igual (el API exige exactamente 4) pero con texto vacío.
    expect(values.features).toHaveLength(4)
    expect(values.features.every((f: { texto: string }) => f.texto === '')).toBe(true)
    expect(values.cercanias).toEqual({ educacion: [], transporte: [], comercios: [], salud: [] })
  })

  it('estado y disponibilidad se eligen por separado y viajan con el resto', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await completarDatosGenerales(user)
    // Orden de los selects en el form: Estado, Disponibilidad (los labels no están
    // asociados por htmlFor, así que se toman por posición).
    const [estado, disponibilidad] = screen.getAllByRole('combobox')
    await user.selectOptions(estado, 'entregado')
    await user.selectOptions(disponibilidad, 'sin-unidades')
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ estado: 'entregado', disponibilidad: 'sin-unidades' })
    // La vista previa refleja ambos badges.
    expect(screen.getByText('Entregado', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByText('Sin unidades', { selector: 'span' })).toBeInTheDocument()
  })

  it('también publica solo con los datos generales', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await completarDatosGenerales(user)
    await user.click(screen.getByRole('button', { name: 'Publicar desarrollo' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][1]).toBe(true)
  })

  it('los datos generales siguen siendo obligatorios', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await completarDatosGenerales(user, 'descripcion')
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }))

    // handleSubmit es async: se da un margen para asegurar que NO se llamó.
    await new Promise((r) => setTimeout(r, 50))
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('las características se pueden completar igual, y viajan con su texto', async () => {
    const user = userEvent.setup()
    const { onSubmit } = renderForm()

    await completarDatosGenerales(user)
    await user.type(screen.getAllByPlaceholderText('Detalle...')[1], 'Pisos de porcelanato')
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    const textos = onSubmit.mock.calls[0][0].features.map((f: { texto: string }) => f.texto)
    expect(textos).toEqual(['', 'Pisos de porcelanato', '', ''])
  })
})

describe('DesarrolloForm — vista previa plegable', () => {
  it('se puede ocultar (saca galería y card) y la preferencia se recuerda al volver a entrar', async () => {
    const user = userEvent.setup()
    useContenidoList.mockReturnValue({ data: { content: [foto(1, 'https://img.test/a.jpg')] }, isLoading: false })
    const { unmount } = renderForm({ desarrollo: desarrolloExistente() })
    expect(screen.getAllByRole('img', { name: 'Foto de Solares Pinamar' })).toHaveLength(1)

    await user.click(screen.getByRole('button', { name: 'Ocultar vista previa' }))
    expect(screen.queryByRole('img', { name: /foto de/i })).not.toBeInTheDocument()
    expect(screen.queryByText('Solares Pinamar', { selector: 'div' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mostrar vista previa' })).toHaveAttribute('aria-expanded', 'false')

    // Al volver a la pantalla sigue plegada; "Mostrar" la trae de vuelta.
    unmount()
    renderForm({ desarrollo: desarrolloExistente() })
    expect(screen.queryByRole('img', { name: /foto de/i })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mostrar vista previa' }))
    expect(screen.getAllByRole('img', { name: 'Foto de Solares Pinamar' })).toHaveLength(1)
  })

  it('el form sigue funcionando con la vista previa plegada', async () => {
    const user = userEvent.setup()
    localStorage.setItem('sdd.backoffice.desarrollo.vistaPrevia', 'oculta')
    const { onSubmit } = renderForm()

    await completarDatosGenerales(user)
    await user.click(screen.getByRole('button', { name: 'Guardar borrador' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
  })
})

describe('DesarrolloForm — vista previa de fotos', () => {
  it('al crear (sin id todavía) no pide contenido ni muestra galería', () => {
    renderForm()

    expect(useContenidoList).not.toHaveBeenCalled()
    expect(screen.queryByRole('img', { name: /foto de/i })).not.toBeInTheDocument()
  })

  it('al editar muestra la galería del desarrollo, pidiendo su contenido', () => {
    useContenidoList.mockReturnValue({
      data: { content: [foto(1, 'https://img.test/a.jpg'), foto(2, 'https://img.test/b.jpg')] },
      isLoading: false,
    })
    renderForm({ desarrollo: desarrolloExistente() })

    expect(useContenidoList).toHaveBeenCalledWith({ desarrolloId: 1, size: 100 })
    expect(screen.getAllByRole('img', { name: 'Foto de Solares Pinamar' })).toHaveLength(2)
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeInTheDocument()
  })

  it('las fotos de la vista previa no abren el carrusel (eso es solo de la ficha pública)', () => {
    useContenidoList.mockReturnValue({ data: { content: [foto(1, 'https://img.test/a.jpg')] }, isLoading: false })
    renderForm({ desarrollo: desarrolloExistente() })

    expect(screen.queryByRole('button', { name: /ampliar foto/i })).not.toBeInTheDocument()
  })

  it('sin fotos ni portada avisa que la ficha se muestra sin galería', () => {
    useContenidoList.mockReturnValue({ data: { content: [] }, isLoading: false })
    renderForm({ desarrollo: desarrolloExistente() })

    expect(screen.getByText(/todavía no hay fotos ni videos cargados/i)).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /foto de/i })).not.toBeInTheDocument()
  })

  it('sin contenido pero con portada muestra la portada, igual que la ficha pública', () => {
    useContenidoList.mockReturnValue({ data: { content: [] }, isLoading: false })
    renderForm({ desarrollo: desarrolloExistente({ imagenPortadaUrl: 'https://img.test/portada.jpg' }) })

    expect(screen.getAllByRole('img', { name: 'Foto de Solares Pinamar' })).toHaveLength(1)
  })
})
