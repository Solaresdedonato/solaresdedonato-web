import { api } from '@/shared/api/axiosInstance'
import type { PageDto } from '@/shared/api/types'
import type { CategoriaContenido, ContenidoFormValues, ContenidoMedia, TipoContenido } from '../schemas/contenido.schema'

const BASE = '/v1/contenido'

export interface ContenidoFilters {
  desarrolloId?: number
  tipo?: TipoContenido
  categoria?: CategoriaContenido
  page?: number
  size?: number
}

export const contenidoService = {
  listar: async (filters: ContenidoFilters = {}): Promise<PageDto<ContenidoMedia>> => {
    const { data } = await api.get<PageDto<ContenidoMedia>>(BASE, { params: filters })
    return data
  },

  crear: async (form: ContenidoFormValues, archivo: File | null): Promise<ContenidoMedia> => {
    const formData = new FormData()
    formData.append('tipo', form.tipo)
    formData.append('titulo', form.titulo)
    if (form.desarrolloId != null) formData.append('desarrolloId', String(form.desarrolloId))
    formData.append('categoria', form.categoria)
    if (form.descripcion) formData.append('descripcion', form.descripcion)
    if (form.tipo === 'video' && form.videoUrl) formData.append('videoUrl', form.videoUrl)
    formData.append('esPortada', String(form.esPortada))
    if (form.tipo === 'foto' && archivo) formData.append('archivo', archivo)

    const { data } = await api.post<ContenidoMedia>(BASE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`)
  },
}
