import { describe, expect, it } from 'vitest'
import { sinGuiones } from './sinGuiones'

describe('sinGuiones', () => {
  it('reemplaza el guion entre espacios por el separador pedido', () => {
    expect(sinGuiones('SOLARES - VILLA LURO', ' ')).toBe('SOLARES VILLA LURO')
    expect(sinGuiones('Tren - Estación Villa Luro')).toBe('Tren, Estación Villa Luro')
  })

  it('reemplaza la raya y la semirraya aunque no tengan espacios', () => {
    expect(sinGuiones('Farmacia Belén — Av. Rivadavia 9626')).toBe('Farmacia Belén, Av. Rivadavia 9626')
    expect(sinGuiones('Jardín N° 07/09– Las Glicinas – Conde 223')).toBe('Jardín N° 07/09, Las Glicinas, Conde 223')
  })

  it('saca los guiones del principio y del final', () => {
    expect(sinGuiones('— Colegio San Martín a 3 cuadras')).toBe('Colegio San Martín a 3 cuadras')
    expect(sinGuiones('SOLARES - DEVOTO - ', ' ')).toBe('SOLARES DEVOTO')
  })

  it('no toca los guiones dentro de palabras o números', () => {
    expect(sinGuiones('Coca-Cola 2024-2025')).toBe('Coca-Cola 2024-2025')
  })
})
