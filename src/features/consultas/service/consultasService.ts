import { api } from '@/shared/api/axiosInstance'
import type { PageDto } from '@/shared/api/types'
import type { ConsultaContacto } from '@/features/contacto/schemas/contacto.schema'
import type { RegistroBroker } from '@/features/broker/schemas/broker.schema'

export const consultasService = {
  listarContacto: async (params: { page?: number; size?: number } = {}): Promise<PageDto<ConsultaContacto>> => {
    const { data } = await api.get<PageDto<ConsultaContacto>>('/v1/consulta-contacto', { params })
    return data
  },
  eliminarContacto: async (id: number): Promise<void> => {
    await api.delete(`/v1/consulta-contacto/${id}`)
  },
  listarBrokers: async (params: { page?: number; size?: number } = {}): Promise<PageDto<RegistroBroker>> => {
    const { data } = await api.get<PageDto<RegistroBroker>>('/v1/registro-broker', { params })
    return data
  },
  eliminarBroker: async (id: number): Promise<void> => {
    await api.delete(`/v1/registro-broker/${id}`)
  },
}
