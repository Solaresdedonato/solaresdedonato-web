import bo from '@/styles/backoffice.module.css'
import { DesarrolloGaleria } from '@/components/DesarrolloGaleria'
import { useContenidoList } from '@/features/contenido/hooks/useContenido'
import type { Desarrollo } from '../schemas/desarrollo.schema'

interface DesarrolloGaleriaPreviewProps {
  desarrollo: Pick<Desarrollo, 'id' | 'nombre' | 'imagenPortadaUrl'>
}

/**
 * Vista previa de cómo se ve la galería de fotos/videos en la ficha pública del
 * desarrollo. Reusa DesarrolloGaleria (el mismo componente que la ficha), alimentado con
 * el listado de contenido del desarrollo — el backend arma `galeria` con el mismo
 * criterio y orden (orden, id), así que lo que se ve acá es lo que se publica.
 */
export function DesarrolloGaleriaPreview({ desarrollo }: DesarrolloGaleriaPreviewProps) {
  const { data, isLoading } = useContenidoList({ desarrolloId: desarrollo.id, size: 100 })
  const galeria = data?.content

  const hayContenido =
    !!desarrollo.imagenPortadaUrl ||
    !!galeria?.some((c) => (c.tipo === 'video' && c.videoUrl) || (c.tipo === 'foto' && c.archivoUrl))

  if (isLoading) return <p className={bo.hint}>Cargando fotos…</p>

  if (!hayContenido) {
    return <p className={bo.hint}>Todavía no hay fotos ni videos cargados: la ficha pública se muestra sin galería.</p>
  }

  return (
    <>
      <div className={bo.galeriaPreviewWrap}>
        <DesarrolloGaleria
          galeria={galeria}
          imagenPortadaUrl={desarrollo.imagenPortadaUrl}
          nombre={desarrollo.nombre}
          className={bo.galeriaPreview}
          miniaturas
        />
      </div>
      <p className={bo.hint}>
        Así se ve la galería en la ficha pública, debajo de la descripción (el video, si hay, va primero). La foto
        marcada como portada es además la imagen grande de arriba de la ficha. Según el ancho de pantalla, la foto se
        recorta distinto.
      </p>
    </>
  )
}
