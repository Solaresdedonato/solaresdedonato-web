import { api } from '@/shared/api/axiosInstance'
import type { ContenidoMedia } from '@/features/contenido/schemas/contenido.schema'

const BASE = '/v1/contenido/hero'

export const heroService = {
  /** Público — sin auth, lo consume el hero de la home. */
  listar: async (): Promise<ContenidoMedia[]> => {
    const { data } = await api.get<ContenidoMedia[]>(BASE)
    return data
  },

  reordenar: async (ids: number[]): Promise<ContenidoMedia[]> => {
    const { data } = await api.put<ContenidoMedia[]>(`${BASE}/orden`, { ids })
    return data
  },
}
