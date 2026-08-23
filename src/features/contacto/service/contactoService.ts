import { api } from '@/shared/api/axiosInstance'
import type { ContactoFormValues } from '../schemas/contacto.schema'

export const contactoService = {
  enviar: async (values: ContactoFormValues): Promise<void> => {
    await api.post('/v1/consulta-contacto', values)
  },
}
