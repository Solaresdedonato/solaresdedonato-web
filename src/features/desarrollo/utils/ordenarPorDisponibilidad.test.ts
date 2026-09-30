import { describe, expect, it } from 'vitest'
import { ordenarPorDisponibilidad } from './ordenarPorDisponibilidad'

const d = (id: number, disponibilidad: 'unidades-disponibles' | 'sin-unidades') => ({ id, disponibilidad })

describe('ordenarPorDisponibilidad', () => {
  it('pone primero los que tienen unidades y al final los agotados', () => {
    const orden = ordenarPorDisponibilidad([d(1, 'sin-unidades'), d(2, 'unidades-disponibles'), d(3, 'sin-unidades')])
    expect(orden.map((x) => x.id)).toEqual([2, 1, 3])
  })

  it('es estable: dentro de cada grupo mantiene el orden original', () => {
    const orden = ordenarPorDisponibilidad([
      d(1, 'unidades-disponibles'),
      d(2, 'sin-unidades'),
      d(3, 'unidades-disponibles'),
      d(4, 'sin-unidades'),
    ])
    expect(orden.map((x) => x.id)).toEqual([1, 3, 2, 4])
  })

  it('no muta el array de entrada', () => {
    const entrada = [d(1, 'sin-unidades'), d(2, 'unidades-disponibles')]
    ordenarPorDisponibilidad(entrada)
    expect(entrada.map((x) => x.id)).toEqual([1, 2])
  })
})
