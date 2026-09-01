import { useMutation, useQueryClient } from '@tanstack/react-query'
import { nombreSinExtension } from '@/shared/utils/nombreSinExtension'
import { contenidoService } from '../service/contenidoService'
import { driveService } from '../service/driveService'
import type { ContenidoFormValues } from '../schemas/contenido.schema'
import type { DriveFile } from '../schemas/drive.schema'

interface LoteInput {
  form: ContenidoFormValues
  archivos: File[]
  driveFiles: DriveFile[]
}

export interface LoteResultado {
  exitosos: number
  fallidos: { nombre: string; mensaje: string }[]
}

function tituloPara(prefijo: string, nombreArchivo: string): string {
  const base = nombreSinExtension(nombreArchivo)
  return prefijo.trim() ? `${prefijo.trim()} — ${base}` : base
}

function mensajeDeError(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return 'Error desconocido'
}

/**
 * Carga masiva de fotos: loopea contenidoService.crear/driveService.importar (los mismos
 * que usa useGuardarContenido para un solo ítem) una vez por foto, en vez de pegarle a un
 * endpoint bulk que no existe -- no hace falta, `orden` para categorías que no son 'hero'
 * siempre resuelve a 0 server-side, así que no hay carrera entre requests secuenciales.
 *
 * Secuencial (no Promise.all) a propósito: evita mandar N uploads multipart en paralelo,
 * y permite seguir con el resto si una foto puntual falla (extensión, tamaño, etc.) en vez
 * de abortar todo el lote. Nunca rechaza la mutation -- el resultado (éxitos/fallos) se
 * devuelve para que el form lo muestre.
 */
export function useGuardarContenidoLote() {
  const queryClient = useQueryClient()

  const mutation = useMutation<LoteResultado, never, LoteInput>({
    mutationFn: async ({ form, archivos, driveFiles }) => {
      const items = form.origen === 'drive' ? driveFiles : archivos
      const resultado: LoteResultado = { exitosos: 0, fallidos: [] }

      for (let i = 0; i < items.length; i++) {
        const esPrimero = i === 0
        const itemForm: ContenidoFormValues = {
          ...form,
          esPortada: form.esPortada && esPrimero,
        }

        try {
          if (form.origen === 'drive') {
            const driveFile = items[i] as DriveFile
            await driveService.importar({
              ...itemForm,
              titulo: tituloPara(form.titulo, driveFile.nombre),
              driveFileId: driveFile.id,
            })
          } else {
            const archivo = items[i] as File
            await contenidoService.crear({ ...itemForm, titulo: tituloPara(form.titulo, archivo.name) }, archivo)
          }
          resultado.exitosos++
        } catch (err) {
          const nombre = form.origen === 'drive' ? (items[i] as DriveFile).nombre : (items[i] as File).name
          resultado.fallidos.push({ nombre, mensaje: mensajeDeError(err) })
        }
      }

      return resultado
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contenido'] })
      queryClient.invalidateQueries({ queryKey: ['desarrollos'] })
    },
  })

  return { guardarLote: mutation.mutateAsync, isLoading: mutation.isPending, resultado: mutation.data }
}
