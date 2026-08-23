export const ROUTES = {
  home: '/',
  desarrolloDetalle: (slug: string) => `/desarrollos/${slug}`,

  backofficeLogin: '/backoffice/login',
  backoffice: '/backoffice',
  backofficeDesarrollos: '/backoffice/desarrollos',
  backofficeDesarrolloNuevo: '/backoffice/desarrollos/nuevo',
  backofficeDesarrolloEditar: (id: number | string) => `/backoffice/desarrollos/${id}/editar`,
  backofficeContenido: '/backoffice/contenido',
  backofficeWeb: '/backoffice/web',
  backofficeConsultas: '/backoffice/consultas',
} as const
