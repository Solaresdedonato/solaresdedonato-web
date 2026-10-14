import { describe, expect, it } from 'vitest'
import { CODIGOS_PAIS, telefonoConCodigo } from './telefono'

describe('telefonoConCodigo', () => {
  it('antepone el código del país elegido', () => {
    expect(telefonoConCodigo('AR', ' 11 5140 7693 ')).toBe('+54 11 5140 7693')
    expect(telefonoConCodigo('UY', '99 123 456')).toBe('+598 99 123 456')
  })

  it('si el número ya viene con "+", lo deja como está', () => {
    expect(telefonoConCodigo('AR', '+972 50 123 4567')).toBe('+972 50 123 4567')
  })

  it('cada país tiene una clave única aunque compartan código', () => {
    const isos = CODIGOS_PAIS.map((p) => p.iso)
    expect(new Set(isos).size).toBe(isos.length)
    expect(CODIGOS_PAIS[0].iso).toBe('AR')
  })
})
