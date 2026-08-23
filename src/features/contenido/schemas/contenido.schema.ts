import { z } from 'zod'

export const TIPOS_CONTENIDO = ['foto', 'video'] as const
export type TipoContenido = (typeof TIPOS_CONTENIDO)[number]

export const CATEGORIAS_CONTENIDO = ['fachada', 'interior', 'amenities', 'obra', 'drone', 'institucional'] as const
export type CategoriaContenido = (typeof CATEGORIAS_CONTENIDO)[number]

export const CATEGORIA_LABELS: Record<CategoriaContenido, string> = {
  fachada: 'Fachada',
  interior: 'Interior',
  amenities: 'Amenities',
  obra: 'Avance de obra',
  drone: 'Drone',
  institucional: 'Institucional',
}

export interface ContenidoMedia {
  id: number
  desarrolloId: number | null
  desarrolloNombre?: string | null
  tipo: TipoContenido
  titulo: string
  categoria: CategoriaContenido
  descripcion: string | null
  archivoUrl: string | null
  videoUrl: string | null
  esPortada: boolean
  orden: number
}

export const ORIGENES_CONTENIDO = ['drive', 'archivo'] as const
export type OrigenContenido = (typeof ORIGENES_CONTENIDO)[number]

export const contenidoFormSchema = z
  .object({
    tipo: z.enum(TIPOS_CONTENIDO),
    // Aplica a foto Y video: de dónde sale el archivo. Drive es el modo por default (ver
    // plan de ingesta); para foto 'archivo' es el fallback si Drive no está disponible
    // o la foto todavía no llegó a la carpeta — para video, 'archivo' significa "pegar
    // una URL externa de YouTube/Vimeo" en vez de subir nada.
    origen: z.enum(ORIGENES_CONTENIDO),
    driveFileId: z.string().nullable(),
    titulo: z.string().min(1, 'Ingresá un título'),
    desarrolloId: z.number().nullable(),
    categoria: z.enum(CATEGORIAS_CONTENIDO),
    descripcion: z.string().optional(),
    videoUrl: z.string().optional(),
    esPortada: z.boolean(),
  })
  .refine((data) => data.tipo !== 'video' || data.origen === 'drive' || !!data.videoUrl, {
    message: 'Ingresá la URL del video',
    path: ['videoUrl'],
  })
  .refine((data) => data.origen !== 'drive' || !!data.driveFileId, {
    message: 'Elegí un archivo de Drive',
    path: ['driveFileId'],
  })
  .refine((data) => data.desarrolloId !== null, {
    // Sin desarrollo asignado el contenido queda huérfano: no lo muestra ninguna
    // pantalla pública (no hay sección "institucional" en el sitio todavía).
    message: 'Seleccioná un desarrollo',
    path: ['desarrolloId'],
  })

export type ContenidoFormValues = z.infer<typeof contenidoFormSchema>

export function emptyContenidoForm(): ContenidoFormValues {
  return {
    tipo: 'foto',
    origen: 'drive',
    driveFileId: null,
    titulo: '',
    desarrolloId: null,
    categoria: 'fachada',
    descripcion: '',
    videoUrl: '',
    esPortada: false,
  }
}
