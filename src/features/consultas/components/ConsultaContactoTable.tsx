import bo from '@/styles/backoffice.module.css'
import type { ConsultaContacto } from '@/features/contacto/schemas/contacto.schema'

const COLUMNS = '1.2fr 1.6fr 1.1fr 1.5fr 1.8fr 0.9fr 0.5fr'

interface ConsultaContactoTableProps {
  items: ConsultaContacto[]
  onEliminar: (item: ConsultaContacto) => void
}

export function ConsultaContactoTable({ items, onEliminar }: ConsultaContactoTableProps) {
  return (
    <div className={bo.tableWrap}>
      <div className={bo.tableHeader} style={{ gridTemplateColumns: COLUMNS, minWidth: 900 }}>
        <div>Nombre</div>
        <div>Email</div>
        <div>Teléfono</div>
        <div>Proyecto de interés</div>
        <div>Mensaje</div>
        <div>Fecha</div>
        <div />
      </div>
      {items.map((c) => (
        <div className={bo.tableRow} style={{ gridTemplateColumns: COLUMNS, minWidth: 900 }} key={c.id}>
          <div className={bo.tableCellPrimary}>
            {c.nombre} {c.apellido}
          </div>
          <div className={bo.tableCellMuted}>{c.email}</div>
          <div className={bo.tableCellMuted}>{c.telefono}</div>
          <div className={bo.tableCellMuted}>{c.proyectoInteres ?? '—'}</div>
          <div className={bo.tableCellClamp} title={c.mensaje}>
            {c.mensaje}
          </div>
          <div className={bo.tableCellDim}>{new Date(c.stampDate).toLocaleDateString('es-AR')}</div>
          <div>
            <button type="button" className={bo.deleteLink} onClick={() => onEliminar(c)}>
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
