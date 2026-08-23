import { api } from '@/shared/api/axiosInstance'
import type { PageDto } from '@/shared/api/types'
import type { Desarrollo, DesarrolloFormValues, EstadoDesarrollo, ResumenDesarrollos } from '../schemas/desarrollo.schema'

const BASE = '/v1/desarrollo'

export interface DesarrolloPublicoFilters {
  estado?: EstadoDesarrollo
  zona?: string
  page?: number
  size?: number
}

export interface DesarrolloAdminFilters extends DesarrolloPublicoFilters {
  publicado?: boolean
}

const DIACRITICS_REGEX = /[̀-ͯ]/g

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const desarrolloService = {
  listarPublicados: async (filters: DesarrolloPublicoFilters = {}): Promise<PageDto<Desarrollo>> => {
    const { data } = await api.get<PageDto<Desarrollo>>(BASE, { params: filters })
    return data
  },

  obtenerPorSlug: async (slug: string): Promise<Desarrollo> => {
    const { data } = await api.get<Desarrollo>(`${BASE}/${slug}`)
    return data
  },

  listarAdmin: async (filters: DesarrolloAdminFilters = {}): Promise<PageDto<Desarrollo>> => {
    const { data } = await api.get<PageDto<Desarrollo>>(`${BASE}/admin`, { params: filters })
    return data
  },

  obtenerPorId: async (id: number): Promise<Desarrollo> => {
    const { data } = await api.get<Desarrollo>(`${BASE}/admin/${id}`)
    return data
  },

  resumen: async (): Promise<ResumenDesarrollos> => {
    const { data } = await api.get<ResumenDesarrollos>(`${BASE}/admin/resumen`)
    return data
  },

  crear: async (form: DesarrolloFormValues, publicar: boolean): Promise<Desarrollo> => {
    const { data } = await api.post<Desarrollo>(BASE, { ...form, slug: slugify(form.nombre), publicar })
    return data
  },

  actualizar: async (id: number, slug: string, form: DesarrolloFormValues, publicar: boolean): Promise<Desarrollo> => {
    const { data } = await api.put<Desarrollo>(`${BASE}/${id}`, { ...form, slug, publicar })
    return data
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`${BASE}/${id}`)
  },
}
