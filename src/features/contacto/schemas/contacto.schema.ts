import { z } from 'zod'

export interface ConsultaContacto {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  proyectoInteres: string | null
  mensaje: string
  stampDate: string
}

export const PROYECTOS_INTERES = [
  'Pinamar Norte — Blvd. Ameghino 349',
  'Julián Álvarez 1129 — Palermo',
  'Tokenización inmobiliaria',
  'Renta fija (Solares Deals)',
  'Asesoramiento general',
] as const

export const contactoFormSchema = z.object({
  nombre: z.string().min(1, 'Ingresá tu nombre'),
  apellido: z.string().min(1, 'Ingresá tu apellido'),
  email: z.string().email('Ingresá un email válido'),
  telefono: z.string().min(1, 'Ingresá tu teléfono'),
  proyectoInteres: z.string().optional(),
  mensaje: z.string().min(1, 'Contanos en qué te podemos ayudar'),
})

export type ContactoFormValues = z.infer<typeof contactoFormSchema>
