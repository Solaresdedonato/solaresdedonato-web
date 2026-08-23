import { useQuery } from '@tanstack/react-query'
import { desarrolloService, type DesarrolloAdminFilters } from '../service/desarrolloService'

export function useDesarrollosAdmin(filters: DesarrolloAdminFilters = {}) {
  return useQuery({
    queryKey: ['desarrollos', 'admin', filters],
    queryFn: () => desarrolloService.listarAdmin(filters),
  })
}
