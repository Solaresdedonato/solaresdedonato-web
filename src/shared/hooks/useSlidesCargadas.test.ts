import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSlidesCargadas } from './useSlidesCargadas'

const cargadas = (fn: (i: number) => boolean, total: number) => [...Array(total).keys()].filter(fn)

describe('useSlidesCargadas', () => {
  it('al arrancar carga solo la actual y la siguiente', () => {
    const { result } = renderHook(() => useSlidesCargadas(0, 5))
    expect(cargadas(result.current, 5)).toEqual([0, 1])
  })

  it('con conAnterior también carga la anterior (circular)', () => {
    const { result } = renderHook(() => useSlidesCargadas(0, 5, true))
    expect(cargadas(result.current, 5)).toEqual([0, 1, 4])
  })

  it('las slides ya vistas quedan cargadas', () => {
    const { result, rerender } = renderHook(({ actual }) => useSlidesCargadas(actual, 5), { initialProps: { actual: 0 } })
    rerender({ actual: 1 })
    rerender({ actual: 2 })
    expect(cargadas(result.current, 5)).toEqual([0, 1, 2, 3])
  })
})
