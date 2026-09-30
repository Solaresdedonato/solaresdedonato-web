import { ESTADO_LABELS_PUBLICO, type EstadoDesarrollo } from './desarrollo.schema'

/** Colores del diccionario ESTADOS del backoffice HTML original, reducidos a los dos
 *  estados vigentes. El label es el público: se usa en la vista previa de la ficha. */
export const ESTADOS: Record<EstadoDesarrollo, { label: string; color: string; border: string }> = {
  'en-pozo': { label: ESTADO_LABELS_PUBLICO['en-pozo'], color: '#EABC7B', border: '#EABC7B' },
  entregado: { label: ESTADO_LABELS_PUBLICO.entregado, color: '#999999', border: 'rgba(255,255,255,0.15)' },
}
