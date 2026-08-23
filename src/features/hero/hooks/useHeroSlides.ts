import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { EnhancedErrorResponse } from '@/shared/api/errorSchema'
import { contenidoService } from '@/features/contenido/service/contenidoService'
import { driveService } from '@/features/contenido/service/driveService'
import type { ContenidoFormValues, ContenidoMedia } from '@/features/contenido/schemas/contenido.schema'
import { heroService } from '../service/heroService'

const QUERY_KEY = ['hero-slides']

/** Usado tanto por el hero público (home) como por /backoffice/hero — mismo endpoint,
 *  mismos datos, así que comparten cache: crear/eliminar/reordenar una slide invalida
 *  esta key y ambas pantallas quedan al día. */
export function useHeroSlides() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => heroService.listar(),
  })
}

interface GuardarHeroSlideInput {
  form: ContenidoFormValues
  archivo: File | null
}

/** Mismo despacho Drive/multipart que useGuardarContenido — el form ya viene armado
 *  con categoria: 'hero' y desarrolloId: null desde HeroPage. */
export function useGuardarHeroSlide() {
  const queryClient = useQueryClient()

  const mutation = useMutation<ContenidoMedia, EnhancedErrorResponse, GuardarHeroSlideInput>({
    mutationFn: ({ form, archivo }) =>
      form.origen === 'drive' ? driveService.importar(form) : contenidoService.crear(form, archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  return { guardar: mutation.mutate, isLoading: mutation.isPending, error: mutation.error }
}

export function useEliminarHeroSlide() {
  const queryClient = useQueryClient()

  const mutation = useMutation<void, EnhancedErrorResponse, number>({
    mutationFn: (id) => contenidoService.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  return { eliminar: mutation.mutate, isLoading: mutation.isPending, error: mutation.error }
}

export function useReordenarHero() {
  const queryClient = useQueryClient()

  const mutation = useMutation<ContenidoMedia[], EnhancedErrorResponse, number[]>({
    mutationFn: (ids) => heroService.reordenar(ids),
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data)
    },
  })

  return { reordenar: mutation.mutate, isLoading: mutation.isPending }
}
