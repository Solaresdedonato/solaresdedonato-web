import {
  DISPONIBILIDAD_LABELS,
  ESTADO_LABELS,
  type DisponibilidadDesarrollo,
  type EstadoDesarrollo,
} from './desarrollo.schema'

interface BadgeStyle {
  label: string
  color: string
  border: string
}

/** Colores del diccionario ESTADOS del backoffice HTML original, reducidos a los dos
 *  estados vigentes (tabla y vista previa del backoffice). */
export const ESTADOS: Record<EstadoDesarrollo, BadgeStyle> = {
  'en-pozo': { label: ESTADO_LABELS['en-pozo'], color: '#EABC7B', border: '#EABC7B' },
  entregado: { label: ESTADO_LABELS.entregado, color: '#F5F0E8', border: '#555555' },
}

/** Badge de disponibilidad: dorado con unidades, gris apagado sin unidades. */
export const DISPONIBILIDADES: Record<DisponibilidadDesarrollo, BadgeStyle> = {
  'unidades-disponibles': { label: DISPONIBILIDAD_LABELS['unidades-disponibles'], color: '#EABC7B', border: '#EABC7B' },
  'sin-unidades': { label: DISPONIBILIDAD_LABELS['sin-unidades'], color: '#999999', border: 'rgba(255,255,255,0.15)' },
}
