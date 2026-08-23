import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { EnhancedErrorResponse } from '@/shared/api/errorSchema'
import { consultasService } from '../service/consultasService'

export function useConsultasContacto() {
  return useQuery({
    queryKey: ['consulta-contacto'],
    queryFn: () => consultasService.listarContacto({ size: 100 }),
  })
}

export function useEliminarConsultaContacto() {
  const queryClient = useQueryClient()
  const mutation = useMutation<void, EnhancedErrorResponse, number>({
    mutationFn: (id) => consultasService.eliminarContacto(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consulta-contacto'] }),
  })
  return { eliminar: mutation.mutate, isLoading: mutation.isPending, error: mutation.error }
}

export function useRegistrosBroker() {
  return useQuery({
    queryKey: ['registro-broker'],
    queryFn: () => consultasService.listarBrokers({ size: 100 }),
  })
}

export function useEliminarRegistroBroker() {
  const queryClient = useQueryClient()
  const mutation = useMutation<void, EnhancedErrorResponse, number>({
    mutationFn: (id) => consultasService.eliminarBroker(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['registro-broker'] }),
  })
  return { eliminar: mutation.mutate, isLoading: mutation.isPending, error: mutation.error }
}
