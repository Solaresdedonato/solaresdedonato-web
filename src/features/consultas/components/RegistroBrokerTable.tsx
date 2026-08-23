import bo from '@/styles/backoffice.module.css'
import type { RegistroBroker } from '@/features/broker/schemas/broker.schema'

const COLUMNS = '1.2fr 1.6fr 1.1fr 1.3fr 1.1fr 1.3fr 0.9fr 0.5fr'

interface RegistroBrokerTableProps {
  items: RegistroBroker[]
  onEliminar: (item: RegistroBroker) => void
}

export function RegistroBrokerTable({ items, onEliminar }: RegistroBrokerTableProps) {
  return (
    <div className={bo.tableWrap}>
      <div className={bo.tableHeader} style={{ gridTemplateColumns: COLUMNS, minWidth: 960 }}>
        <div>Nombre</div>
        <div>Email</div>
        <div>Teléfono</div>
        <div>Inmobiliaria</div>
        <div>Matrícula</div>
        <div>Zona</div>
        <div>Fecha</div>
        <div />
      </div>
      {items.map((b) => (
        <div className={bo.tableRow} style={{ gridTemplateColumns: COLUMNS, minWidth: 960 }} key={b.id}>
          <div className={bo.tableCellPrimary}>{b.nombre}</div>
          <div className={bo.tableCellMuted}>{b.email}</div>
          <div className={bo.tableCellMuted}>{b.telefono}</div>
          <div className={bo.tableCellMuted}>{b.inmobiliaria}</div>
          <div className={bo.tableCellMuted}>{b.matricula || '—'}</div>
          <div className={bo.tableCellMuted}>{b.zonaOperacion}</div>
          <div className={bo.tableCellDim}>{new Date(b.stampDate).toLocaleDateString('es-AR')}</div>
          <div>
            <button type="button" className={bo.deleteLink} onClick={() => onEliminar(b)}>
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
