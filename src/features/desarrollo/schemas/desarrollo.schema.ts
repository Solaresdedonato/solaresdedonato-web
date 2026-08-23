import { z } from 'zod'
import type { ContenidoMedia } from '@/features/contenido/schemas/contenido.schema'

export const ESTADOS_DESARROLLO = ['en-venta', 'preventa', 'en-obra', 'entregado', 'proximamente'] as const
export type EstadoDesarrollo = (typeof ESTADOS_DESARROLLO)[number]

export const ESTADO_LABELS: Record<EstadoDesarrollo, string> = {
  'en-venta': 'En venta',
  preventa: 'Preventa',
  'en-obra': 'En obra',
  entregado: 'Entregado',
  proximamente: 'Próximamente',
}

export const FEATURE_CLAVES = ['ubicacion', 'confort', 'accesos', 'comercial'] as const
export type FeatureClave = (typeof FEATURE_CLAVES)[number]

export const FEATURE_TITULOS: Record<FeatureClave, string> = {
  ubicacion: 'Ubicación',
  confort: 'Confort',
  accesos: 'Accesos',
  comercial: 'Comercial',
}

export interface DesarrolloFeature {
  clave: FeatureClave
  titulo: string
  texto: string
}

export interface DesarrolloCercanias {
  educacion: string[]
  transporte: string[]
  comercios: string[]
  salud: string[]
}

export const CERCANIAS_CATEGORIAS = [
  { key: 'educacion', titulo: 'Educación', placeholder: 'Un ítem por línea. Ej: Colegio San Martín a 3 cuadras' },
  { key: 'transporte', titulo: 'Transporte', placeholder: 'Un ítem por línea. Ej: Subte línea B a 2 cuadras' },
  { key: 'comercios', titulo: 'Comercios', placeholder: 'Un ítem por línea. Ej: Supermercado Coto a 4 cuadras' },
  { key: 'salud', titulo: 'Salud y esparcimiento', placeholder: 'Un ítem por línea. Ej: Hospital Rivadavia a 6 cuadras' },
] as const satisfies ReadonlyArray<{ key: keyof DesarrolloCercanias; titulo: string; placeholder: string }>

export interface Desarrollo {
  id: number
  slug: string
  nombre: string
  zona: string
  direccion: string
  estado: EstadoDesarrollo
  descripcion: string
  features: DesarrolloFeature[]
  cercanias: DesarrolloCercanias
  instrumentoTokenizacion: boolean
  instrumentoRentaFija: boolean
  publicado: boolean
  imagenPortadaUrl: string | null
  /** Solo viene poblada en GET /v1/desarrollo/{slug} (el backend ya la arma ahí,
   *  componiendo ContenidoMediaRepositoryPort) — ausente en el listado y en el admin. */
  galeria?: ContenidoMedia[]
}

export interface ResumenDesarrollos {
  total: number
  enVenta: number
  preventa: number
  entregados: number
}

const featureSchema = z.object({
  clave: z.enum(FEATURE_CLAVES),
  titulo: z.string().min(1),
  texto: z.string().min(1, 'Completá el detalle'),
})

export const desarrolloFormSchema = z.object({
  nombre: z.string().min(1, 'Ingresá el nombre del desarrollo'),
  zona: z.string().min(1, 'Ingresá la zona'),
  direccion: z.string().min(1, 'Ingresá la dirección'),
  estado: z.enum(ESTADOS_DESARROLLO),
  descripcion: z.string().min(1, 'Ingresá la descripción'),
  features: z.array(featureSchema).length(4),
  cercanias: z.object({
    educacion: z.array(z.string()),
    transporte: z.array(z.string()),
    comercios: z.array(z.string()),
    salud: z.array(z.string()),
  }),
  instrumentoTokenizacion: z.boolean(),
  instrumentoRentaFija: z.boolean(),
})

export type DesarrolloFormValues = z.infer<typeof desarrolloFormSchema>

export function emptyDesarrolloForm(): DesarrolloFormValues {
  return {
    nombre: '',
    zona: '',
    direccion: '',
    estado: 'en-venta',
    descripcion: '',
    features: FEATURE_CLAVES.map((clave) => ({ clave, titulo: FEATURE_TITULOS[clave], texto: '' })),
    cercanias: { educacion: [], transporte: [], comercios: [], salud: [] },
    instrumentoTokenizacion: false,
    instrumentoRentaFija: false,
  }
}
