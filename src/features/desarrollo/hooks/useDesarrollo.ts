import { useQuery } from '@tanstack/react-query'
import { desarrolloService } from '../service/desarrolloService'
import type { EstadoDesarrollo } from '../schemas/desarrollo.schema'

export function useDesarrolloAdmin(id: number | undefined) {
  return useQuery({
    queryKey: ['desarrollo', 'admin', id],
    queryFn: () => desarrolloService.obtenerPorId(id!),
    enabled: id !== undefined,
  })
}

export function useDesarrolloPorSlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['desarrollo', 'slug', slug],
    queryFn: () => desarrolloService.obtenerPorSlug(slug!),
    enabled: !!slug,
  })
}

export function useResumenDesarrollos() {
  return useQuery({
    queryKey: ['desarrollos', 'resumen'],
    queryFn: () => desarrolloService.resumen(),
  })
}

export function useDesarrollosPublicados(filters: { estado?: EstadoDesarrollo; zona?: string } = {}) {
  return useQuery({
    queryKey: ['desarrollos', 'publicados', filters],
    queryFn: () => desarrolloService.listarPublicados({ ...filters, size: 100 }),
  })
}
