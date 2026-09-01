import { z } from 'zod'

export const TIPOS_CONTENIDO = ['foto', 'video'] as const
export type TipoContenido = (typeof TIPOS_CONTENIDO)[number]

export const CATEGORIAS_CONTENIDO = ['fachada', 'interior', 'amenities', 'obra', 'drone', 'institucional', 'hero'] as const
export type CategoriaContenido = (typeof CATEGORIAS_CONTENIDO)[number]

export const CATEGORIA_LABELS: Record<CategoriaContenido, string> = {
  fachada: 'Fachada',
  interior: 'Interior',
  amenities: 'Amenities',
  obra: 'Avance de obra',
  drone: 'Drone',
  institucional: 'Institucional',
  // No aparece en el selector de categoría de ContenidoForm (ver CATEGORIAS_SELECCIONABLES):
  // 'hero' se administra aparte, desde /backoffice/hero, no pertenece a ningún desarrollo.
  hero: 'Hero (carrusel de inicio)',
}

/** CATEGORIAS_CONTENIDO menos 'hero': el selector de categoría de ContenidoForm sigue
 *  siendo "contenido de un desarrollo" — hero se carga desde su propia pantalla. */
export const CATEGORIAS_SELECCIONABLES = CATEGORIAS_CONTENIDO.filter((c) => c !== 'hero')

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
    // Para foto es un prefijo OPCIONAL: el título real de cada foto lo arma
    // useGuardarContenidoLote a partir del nombre de archivo. Solo video (un único
    // ítem, sin nombre de archivo del que derivar nada) sigue exigiéndolo.
    titulo: z.string(),
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
  .refine((data) => data.tipo !== 'video' || data.titulo.trim().length > 0, {
    message: 'Ingresá un título',
    path: ['titulo'],
  })
  .refine((data) => data.tipo !== 'video' || data.origen !== 'drive' || !!data.driveFileId, {
    // Para foto, la selección de Drive es un array (driveFiles) que vive fuera del
    // form de react-hook-form — ver ContenidoForm/useGuardarContenidoLote — así que
    // este campo/refine ya no le compete.
    message: 'Elegí un archivo de Drive',
    path: ['driveFileId'],
  })
  .refine((data) => data.categoria === 'hero' || data.desarrolloId !== null, {
    // Sin desarrollo asignado el contenido queda huérfano: no lo muestra ninguna
    // pantalla pública. Única excepción: 'hero' (carrusel de inicio), que por diseño
    // no pertenece a un desarrollo — se carga desde /backoffice/hero, no desde acá.
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
