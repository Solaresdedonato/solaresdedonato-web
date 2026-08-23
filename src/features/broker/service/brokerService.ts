import { api } from '@/shared/api/axiosInstance'
import type { BrokerFormValues } from '../schemas/broker.schema'

export const brokerService = {
  enviar: async (values: BrokerFormValues): Promise<void> => {
    await api.post('/v1/registro-broker', values)
  },
}
