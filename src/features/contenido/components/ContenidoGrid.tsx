import bo from '@/styles/backoffice.module.css'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import type { ContenidoMedia } from '../schemas/contenido.schema'

interface ContenidoGridProps {
  items: ContenidoMedia[]
  onEliminar?: (item: ContenidoMedia) => void
}

export function ContenidoGrid({ items, onEliminar }: ContenidoGridProps) {
  return (
    <div className={bo.mediaGrid}>
      {items.map((item) => {
        const tieneImagen = item.tipo === 'foto' && !!item.archivoUrl
        return (
          <div key={item.id} className={bo.mediaTile} style={{ cursor: 'default' }}>
            <div className={bo.mediaTileThumbWrap}>
              {tieneImagen ? (
                <img className={bo.mediaThumb} src={mediaUrl(item.archivoUrl)} alt={item.titulo} />
              ) : (
                <div
                  className={bo.mediaThumb}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span style={{ fontSize: '1.8rem', color: '#555555' }}>{item.tipo === 'video' ? '▶' : '▨'}</span>
                </div>
              )}
              <span
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  left: '0.5rem',
                  fontSize: '0.6rem',
                  letterSpacing: '0.1em',
                  color: '#eabc7b',
                  textTransform: 'uppercase',
                  background: 'rgba(8,8,8,0.7)',
                  padding: '0.2rem 0.5rem',
                }}
              >
                {item.tipo}
              </span>
              {item.esPortada && <span className={bo.mediaTileBadge}>Portada</span>}
            </div>
            <div className={bo.mediaTileBody}>
              <div className={bo.mediaTileName}>{item.titulo}</div>
              <div className={bo.mediaTileMeta}>{item.desarrolloNombre ?? '—'}</div>
              {onEliminar && (
                <div style={{ marginTop: '0.4rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" className={bo.deleteLink} onClick={() => onEliminar(item)}>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
