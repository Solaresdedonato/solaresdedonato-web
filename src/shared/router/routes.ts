export const ROUTES = {
  home: '/',
  desarrolloDetalle: (slug: string) => `/desarrollos/${slug}`,

  backofficeLogin: '/backoffice/login',
  backoffice: '/backoffice',
  backofficeDesarrollos: '/backoffice/desarrollos',
  backofficeDesarrolloNuevo: '/backoffice/desarrollos/nuevo',
  backofficeDesarrolloEditar: (id: number | string) => `/backoffice/desarrollos/${id}/editar`,
  backofficeDesarrolloContenido: (id: number | string) => `/backoffice/desarrollos/${id}/contenido`,
  backofficeWeb: '/backoffice/web',
  backofficeConsultas: '/backoffice/consultas',
} as const
