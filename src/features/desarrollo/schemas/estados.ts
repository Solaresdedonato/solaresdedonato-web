import type { EstadoDesarrollo } from './desarrollo.schema'

/** Colores exactos del diccionario ESTADOS del backoffice HTML original. */
export const ESTADOS: Record<EstadoDesarrollo, { label: string; color: string; border: string }> = {
  'en-venta': { label: 'En venta', color: '#EABC7B', border: '#EABC7B' },
  preventa: { label: 'Preventa', color: '#F2D5A0', border: '#EABC7B' },
  'en-obra': { label: 'En obra', color: '#F5F0E8', border: '#555555' },
  entregado: { label: 'Entregado', color: '#999999', border: 'rgba(255,255,255,0.15)' },
  proximamente: { label: 'Próximamente', color: '#EABC7B', border: 'rgba(234,188,123,0.3)' },
}
