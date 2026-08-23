import { z } from 'zod'

export const EXPERIENCIAS_BROKER = ['Menos de 2 años', '2 a 5 años', '5 a 10 años', 'Más de 10 años'] as const
export type ExperienciaBroker = (typeof EXPERIENCIAS_BROKER)[number]

export const ZONAS_OPERACION = [
  'CABA - Norte (Belgrano, Núñez, Palermo)',
  'CABA - Centro (Recoleta, Retiro, San Telmo)',
  'CABA - Oeste (Villa Devoto, Caballito)',
  'CABA - Sur',
  'GBA Norte',
  'GBA Sur',
  'Costa Atlántica (Pinamar, Cariló)',
  'Interior del país',
  'Cobertura nacional',
] as const

export const TIPOS_OPERACION = ['vivienda', 'inversion', 'renta', 'vacacional'] as const
export type TipoOperacion = (typeof TIPOS_OPERACION)[number]

export const TIPO_OPERACION_LABELS: Record<TipoOperacion, string> = {
  vivienda: 'Vivienda permanente',
  inversion: 'Inversión',
  renta: 'Renta / Alquiler',
  vacacional: 'Vacacional',
}

export const OPERACIONES_CERRADAS = [
  '1 a 5 operaciones',
  '6 a 15 operaciones',
  '16 a 30 operaciones',
  'Más de 30 operaciones',
] as const

export interface RegistroBroker {
  id: number
  nombre: string
  email: string
  telefono: string
  inmobiliaria: string
  matricula: string | null
  experiencia: ExperienciaBroker | null
  zonaOperacion: string
  tipoOperaciones: TipoOperacion[]
  operacionesCerradas: string | null
  mensaje: string | null
  stampDate: string
}

export const brokerFormSchema = z.object({
  nombre: z.string().min(1, 'Ingresá tu nombre y apellido'),
  email: z.string().email('Ingresá un email válido'),
  telefono: z.string().min(1, 'Ingresá tu teléfono'),
  inmobiliaria: z.string().min(1, 'Ingresá tu inmobiliaria/empresa'),
  matricula: z.string().optional(),
  experiencia: z.string().optional(),
  zonaOperacion: z.string().min(1, 'Seleccioná tu zona'),
  tipoOperaciones: z.array(z.enum(TIPOS_OPERACION)),
  operacionesCerradas: z.string().optional(),
  mensaje: z.string().optional(),
})

export type BrokerFormValues = z.infer<typeof brokerFormSchema>
