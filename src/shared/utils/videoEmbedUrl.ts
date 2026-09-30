/**
 * Los videos pegados a mano como "URL externa" en el form (YouTube/Vimeo) llegan tal cual
 * los copió el usuario desde la barra del navegador — esos hay que convertirlos a su
 * formato de embed para el <iframe>. Los importados de Drive no pasan por acá: ver
 * esVideoServidoPorApi.
 */
export function videoEmbedUrl(url: string): string {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{6,})/)
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return url
}

/**
 * Los videos importados de Drive no traen un link externo: el back expone un path
 * relativo a la API (`/v1/contenido/{id}/video`, ver ContenidoMediaDto.videoUrl) que
 * streamea el archivo con la credencial del service account y soporte de Range. Se
 * reproducen con <video>, no con iframe — el `/preview` de Drive solo funciona si el
 * archivo está compartido públicamente, y en la práctica no lo estaba (quedaba en
 * blanco). Mismo criterio que mediaUrl para archivoUrl: relativo = servido por la API.
 */
export function esVideoServidoPorApi(url: string): boolean {
  return url.startsWith('/')
}
