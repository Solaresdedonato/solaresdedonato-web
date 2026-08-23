import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { EnhancedErrorResponse } from '@/shared/api/errorSchema'
import { contenidoService } from '../service/contenidoService'
import { driveService } from '../service/driveService'
import type { ContenidoFormValues, ContenidoMedia } from '../schemas/contenido.schema'

interface GuardarContenidoInput {
  form: ContenidoFormValues
  archivo: File | null
}

/**
 * Un solo "Agregar contenido" con dos backends detrás, igual que
 * useGuardarDesarrollo despacha crear/actualizar dentro de un único mutationFn.
 * ContenidoPage y ContenidoForm no necesitan saber que existen dos caminos.
 *
 * origen === 'drive' cubre tanto foto (se descarga y se aloja) como video (se enlaza
 * directo a Drive, sin descargar nada) — el backend decide cuál es cuál a partir del
 * mimeType real del archivo, no de lo que mande el form.
 */
export function useGuardarContenido() {
  const queryClient = useQueryClient()

  const mutation = useMutation<ContenidoMedia, EnhancedErrorResponse, GuardarContenidoInput>({
    mutationFn: ({ form, archivo }) =>
      form.origen === 'drive' ? driveService.importar(form) : contenidoService.crear(form, archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contenido'] })
      queryClient.invalidateQueries({ queryKey: ['desarrollos'] })
    },
  })

  return { guardar: mutation.mutate, isLoading: mutation.isPending, error: mutation.error }
}
