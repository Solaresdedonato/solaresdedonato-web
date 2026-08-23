import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { EnhancedErrorResponse } from '@/shared/api/errorSchema'
import { contenidoService, type ContenidoFilters } from '../service/contenidoService'

export function useContenidoList(filters: ContenidoFilters = {}) {
  return useQuery({
    queryKey: ['contenido', filters],
    queryFn: () => contenidoService.listar(filters),
  })
}

// El alta (multipart o Drive) vive en useGuardarContenido — un solo mutationFn que
// despacha entre los dos backends, así ContenidoPage no necesita saber que existen dos.

export function useEliminarContenido() {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, EnhancedErrorResponse, number>({
    mutationFn: (id) => contenidoService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contenido'] })
      queryClient.invalidateQueries({ queryKey: ['desarrollos'] })
    },
  })

  return { eliminar: mutation.mutate, isLoading: mutation.isPending, error: mutation.error }
}
