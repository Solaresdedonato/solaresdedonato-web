import { useMutation } from '@tanstack/react-query'
import type { EnhancedErrorResponse } from '@/shared/api/errorSchema'
import { brokerService } from '../service/brokerService'
import type { BrokerFormValues } from '../schemas/broker.schema'

export function useEnviarBroker() {
  const mutation = useMutation<void, EnhancedErrorResponse, BrokerFormValues>({
    mutationFn: (values) => brokerService.enviar(values),
  })

  return { enviar: mutation.mutate, isLoading: mutation.isPending, error: mutation.error, isSuccess: mutation.isSuccess }
}
