import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { MetricasDestacadas } from './MetricasDestacadas'

type Disparar = (entry: Pick<IntersectionObserverEntry, 'isIntersecting' | 'intersectionRatio'>) => void

let disparar: Disparar = () => {}

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: (entries: unknown[]) => void) {
        disparar = (entry) => cb([entry])
      }
      observe() {}
      disconnect() {}
    },
  )
  // Con movimiento reducido el contador salta directo al valor final: el test no depende
  // de requestAnimationFrame.
  vi.stubGlobal('matchMedia', () => ({ matches: true }))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const ITEMS = [
  { to: 26, prefix: '+', label: 'Desarrollos' },
  { to: 30, prefix: '+', suffix: 'k', label: 'M² construidos' },
]

describe('MetricasDestacadas', () => {
  it('pone el prefijo delante del número', () => {
    render(<MetricasDestacadas items={ITEMS} />)

    act(() => disparar({ isIntersecting: true, intersectionRatio: 1 }))

    expect(screen.getByText('+26')).toBeInTheDocument()
    expect(screen.getByText('+30k')).toBeInTheDocument()
  })

  it('no arranca si se ve menos del umbral', () => {
    render(<MetricasDestacadas items={ITEMS} />)

    act(() => disparar({ isIntersecting: true, intersectionRatio: 0.1 }))

    expect(screen.getByText('+0')).toBeInTheDocument()
  })

  it('vuelve a 0 al salir de pantalla y cuenta de nuevo al volver', () => {
    render(<MetricasDestacadas items={ITEMS} />)

    act(() => disparar({ isIntersecting: true, intersectionRatio: 1 }))
    expect(screen.getByText('+26')).toBeInTheDocument()

    act(() => disparar({ isIntersecting: false, intersectionRatio: 0 }))
    expect(screen.getByText('+0')).toBeInTheDocument()
    expect(screen.getByText('+0k')).toBeInTheDocument()

    act(() => disparar({ isIntersecting: true, intersectionRatio: 1 }))
    expect(screen.getByText('+26')).toBeInTheDocument()
  })
})
