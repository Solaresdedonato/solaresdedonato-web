import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axiosInstance'
import type { EnhancedErrorResponse } from '@/shared/api/errorSchema'
import { driveService } from '../service/driveService'
import type { DriveFilePage } from '../schemas/drive.schema'

/** enabled=false hasta que el modal se abre: sin esto, cada visita a
 *  /backoffice/contenido quemaría una llamada a la API de Drive de arriba. */
export function useDriveArchivos(enabled: boolean, nombre?: string) {
  return useQuery<DriveFilePage, EnhancedErrorResponse>({
    queryKey: ['contenido', 'drive', nombre],
    queryFn: () => driveService.listarArchivos(nombre),
    enabled,
    staleTime: 5 * 60_000,
  })
}

// La importación en sí (mutation) vive en useGuardarContenido, que llama a
// driveService.importar directamente — no hay un useImportarDriveArchivo separado.
// Ese hook invalida queryKey: ['contenido'], y TanStack Query matchea por prefijo por
// default: eso ya invalida ['contenido','drive',nombre] (esta query) también, así que
// yaImportado/contenidoMediaId se refrescan solos en el picker después de importar.

/**
 * El thumbnailLink de Drive requiere la credencial del service account, así que el
 * backend lo proxya en GET /v1/drive/archivo/{id}/miniatura — pero un <img src> pelado
 * tampoco puede mandar el header Authorization que ese endpoint exige. Por eso se pide
 * como blob por axios (que sí agrega el header vía el interceptor) y se arma un
 * object URL, revocado al desmontar.
 */
export function useDriveThumbnail(miniaturaUrl: string | null): string | undefined {
  const [urlProcesada, setUrlProcesada] = useState(miniaturaUrl)
  const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined)

  // "Ajustar estado durante el render" en vez de en un efecto (react-hooks/set-state-in-effect):
  // si cambió el prop, resetea objectUrl en el mismo render — evita el frame de más que
  // deja un setState síncrono al toque de que el efecto dispara.
  if (miniaturaUrl !== urlProcesada) {
    setUrlProcesada(miniaturaUrl)
    setObjectUrl(undefined)
  }

  useEffect(() => {
    if (!miniaturaUrl) return

    let activo = true
    let creada: string | undefined

    api
      .get(miniaturaUrl, { responseType: 'blob' })
      .then((res) => {
        if (!activo) return
        creada = URL.createObjectURL(res.data as Blob)
        setObjectUrl(creada)
      })
      .catch(() => {
        if (activo) setObjectUrl(undefined)
      })

    return () => {
      activo = false
      if (creada) URL.revokeObjectURL(creada)
    }
  }, [miniaturaUrl])

  return objectUrl
}
