import { useMutation } from '@tanstack/react-query'
import type { EnhancedErrorResponse } from '@/shared/api/errorSchema'
import { contactoService } from '../service/contactoService'
import type { ContactoFormValues } from '../schemas/contacto.schema'

export function useEnviarContacto() {
  const mutation = useMutation<void, EnhancedErrorResponse, ContactoFormValues>({
    mutationFn: (values) => contactoService.enviar(values),
  })

  return { enviar: mutation.mutate, isLoading: mutation.isPending, error: mutation.error, isSuccess: mutation.isSuccess }
}
