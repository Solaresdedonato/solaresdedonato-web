import { Link as RouterLink } from 'react-router-dom'
import bo from '@/styles/backoffice.module.css'
import { ROUTES } from '@/shared/router/routes'
import { ESTADOS } from '../schemas/estados'
import { ESTADO_LABELS, type Desarrollo } from '../schemas/desarrollo.schema'

const COLUMNS = '2fr 1.2fr 1fr 1fr 0.8fr'

interface DesarrollosTableProps {
  items: Desarrollo[]
  onEliminar?: (desarrollo: Desarrollo) => void
}

export function DesarrollosTable({ items, onEliminar }: DesarrollosTableProps) {
  return (
    <div className={bo.tableWrap}>
      <div className={bo.tableHeader} style={{ gridTemplateColumns: COLUMNS }}>
        <div>Nombre</div>
        <div>Zona</div>
        <div>Estado</div>
        <div>Publicado</div>
        <div />
      </div>
      {items.map((d) => {
        const estado = ESTADOS[d.estado]
        return (
          <div className={bo.tableRow} style={{ gridTemplateColumns: COLUMNS }} key={d.id}>
            <div className={bo.tableCellPrimary}>{d.nombre}</div>
            <div className={bo.tableCellMuted}>{d.zona}</div>
            <div>
              <span className={bo.badge} style={{ color: estado.color, borderColor: estado.border }}>
                {ESTADO_LABELS[d.estado]}
              </span>
            </div>
            <div>
              <span className={bo.badgeSoft} style={d.publicado ? { color: '#eabc7b', borderColor: '#eabc7b' } : undefined}>
                {d.publicado ? 'Publicado' : 'Borrador'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.9rem' }}>
              <RouterLink to={ROUTES.backofficeDesarrolloEditar(d.id)} className={bo.editLink}>
                Editar →
              </RouterLink>
              {onEliminar && (
                <button type="button" className={bo.deleteLink} onClick={() => onEliminar(d)}>
                  Eliminar
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
