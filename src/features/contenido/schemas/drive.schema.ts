export interface DriveFile {
  id: string
  nombre: string
  mimeType: string
  tamanioBytes: number | null
  anchoPx: number | null
  altoPx: number | null
  fechaCreacion: string | null
  /** Nuestro proxy (/v1/drive/archivo/{id}/miniatura), no el thumbnailLink de Drive —
   *  ese requiere la credencial del service account, un <img> no la tiene. */
  miniaturaUrl: string | null
  yaImportado: boolean
  contenidoMediaId: number | null
}

export interface DriveFilePage {
  archivos: DriveFile[]
  nextPageToken: string | null
}

/** Solo mime types que el backend acepta para foto (ValidadorArchivoImagen) — el resto
 *  se muestra gris y deshabilitado en el picker, no filtrado (para que se entienda por qué). */
export const DRIVE_MIME_IMAGEN = /^image\/(jpeg|png|webp|avif)$/

/** Video: el backend NUNCA lo descarga, solo lo enlaza (ImportarContenidoDesdeDrive) —
 *  por eso no hay una allow-list de formato tan angosta como la de foto, cualquier
 *  video/* que Drive pueda embeber en un iframe sirve. */
export const DRIVE_MIME_VIDEO = /^video\//

export function familiaDriveArchivo(mimeType: string): 'foto' | 'video' | null {
  if (DRIVE_MIME_IMAGEN.test(mimeType)) return 'foto'
  if (DRIVE_MIME_VIDEO.test(mimeType)) return 'video'
  return null
}
