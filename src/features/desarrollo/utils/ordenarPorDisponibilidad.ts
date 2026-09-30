import type { Desarrollo } from '../schemas/desarrollo.schema'

/**
 * Orden de cada carrusel del sitio: primero los que tienen unidades disponibles, al
 * final los agotados. Dentro de cada grupo se respeta el orden en que vinieron del API
 * (Array.prototype.sort es estable). No muta el array de entrada.
 */
export function ordenarPorDisponibilidad<T extends Pick<Desarrollo, 'disponibilidad'>>(items: T[]): T[] {
  const peso = (d: T) => (d.disponibilidad === 'unidades-disponibles' ? 0 : 1)
  return [...items].sort((a, b) => peso(a) - peso(b))
}
