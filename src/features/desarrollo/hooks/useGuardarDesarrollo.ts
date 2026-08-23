import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/shared/router/routes'
import type { EnhancedErrorResponse } from '@/shared/api/errorSchema'
import { desarrolloService } from '../service/desarrolloService'
import type { Desarrollo, DesarrolloFormValues } from '../schemas/desarrollo.schema'

interface GuardarDesarrolloInput {
  form: DesarrolloFormValues
  publicar: boolean
  /** Si viene, es edición (id + slug del desarrollo existente); si no, es alta. */
  existente?: { id: number; slug: string }
}

export function useGuardarDesarrollo() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation<Desarrollo, EnhancedErrorResponse, GuardarDesarrolloInput>({
    mutationFn: ({ form, publicar, existente }) =>
      existente
        ? desarrolloService.actualizar(existente.id, existente.slug, form, publicar)
        : desarrolloService.crear(form, publicar),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['desarrollos'] })
      navigate(ROUTES.backofficeDesarrollos)
    },
  })

  return { guardar: mutation.mutate, isLoading: mutation.isPending, error: mutation.error }
}
