/**
 * Los links de Drive ya vienen listos para <iframe> (`/preview`, ver
 * ArchivoExternoPort#construirUrlReproduccion en el back). Los pegados a mano como
 * "URL externa" en el form (YouTube/Vimeo) llegan tal cual los copió el usuario desde
 * la barra del navegador — esas SÍ hay que convertirlas a su formato de embed.
 */
export function videoEmbedUrl(url: string): string {
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{6,})/)
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return url
}
