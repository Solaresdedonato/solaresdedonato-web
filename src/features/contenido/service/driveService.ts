import { api } from '@/shared/api/axiosInstance'
import type { ContenidoFormValues, ContenidoMedia } from '../schemas/contenido.schema'
import type { DriveFilePage } from '../schemas/drive.schema'

const BASE = '/v1/drive/archivo'

export const driveService = {
  /** Drive lista de a 100 (los más recientes primero) y devuelve nextPageToken si hay
   *  más — useDriveArchivos lo encadena para que el picker pueda "Cargar más". */
  listarArchivos: async (nombre?: string, pageToken?: string): Promise<DriveFilePage> => {
    const { data } = await api.get<DriveFilePage>(BASE, { params: { nombre, pageToken, size: 100 } })
    return data
  },

  // Vive bajo /v1/contenido (no /v1/drive): la importación crea un contenido_media,
  // el mismo recurso que crea el multipart de UploadZone/URL externa — solo cambia de
  // dónde sale el contenido. form.driveFileId ya viene validado como no-nulo por
  // contenidoFormSchema cuando origen=drive (foto o video). El backend decide si es
  // foto o video a partir del mimeType real, no hace falta mandarlo acá.
  importar: async (form: ContenidoFormValues): Promise<ContenidoMedia> => {
    const { data } = await api.post<ContenidoMedia>('/v1/contenido/importacion-drive', {
      driveFileId: form.driveFileId,
      titulo: form.titulo,
      desarrolloId: form.desarrolloId,
      categoria: form.categoria,
      descripcion: form.descripcion || undefined,
      esPortada: form.esPortada,
    })
    return data
  },
}
