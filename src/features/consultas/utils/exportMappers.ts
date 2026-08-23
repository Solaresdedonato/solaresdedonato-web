import type { ConsultaContacto } from '@/features/contacto/schemas/contacto.schema'
import type { RegistroBroker } from '@/features/broker/schemas/broker.schema'
import { TIPO_OPERACION_LABELS } from '@/features/broker/schemas/broker.schema'

export const CONTACTO_HEADERS = ['Nombre', 'Apellido', 'Email', 'Teléfono', 'Proyecto de interés', 'Mensaje', 'Fecha']

export function contactoRowToArray(c: ConsultaContacto): unknown[] {
  return [c.nombre, c.apellido, c.email, c.telefono, c.proyectoInteres ?? '', c.mensaje, new Date(c.stampDate).toLocaleDateString('es-AR')]
}

export const BROKER_HEADERS = [
  'Nombre',
  'Email',
  'Teléfono',
  'Inmobiliaria',
  'Matrícula',
  'Experiencia',
  'Zona de operación',
  'Tipo de operaciones',
  'Operaciones cerradas (12m)',
  'Mensaje',
  'Fecha',
]

export function brokerRowToArray(b: RegistroBroker): unknown[] {
  return [
    b.nombre,
    b.email,
    b.telefono,
    b.inmobiliaria,
    b.matricula ?? '',
    b.experiencia ?? '',
    b.zonaOperacion,
    b.tipoOperaciones.map((t) => TIPO_OPERACION_LABELS[t]).join('; '),
    b.operacionesCerradas ?? '',
    b.mensaje ?? '',
    new Date(b.stampDate).toLocaleDateString('es-AR'),
  ]
}
