import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { EnhancedErrorResponse } from '@/shared/api/errorSchema'
import { desarrolloService } from '../service/desarrolloService'

export function useEliminarDesarrollo() {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, EnhancedErrorResponse, number>({
    mutationFn: (id) => desarrolloService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desarrollos'] })
    },
  })

  return { eliminar: mutation.mutate, isLoading: mutation.isPending, error: mutation.error }
}
