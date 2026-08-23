import { ROUTES } from '@/shared/router/routes'
import type { Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'

interface DesarrolloAccionesBotonesProps {
  desarrollo: Pick<
    Desarrollo,
    'showroomVirtualUrl' | 'brochurePlanosUrl' | 'avanceObraUrl' | 'solicitarInformacionUrl'
  >
  /** El botón "Solicitar información" navega a #contacto igual en el modal y en la
   *  página de detalle cuando el desarrollo no tiene una URL propia cargada — esto es
   *  lo único que cambia entre los dos usos (el modal también necesita cerrarse antes
   *  de navegar). */
  onSolicitarInfo?: () => void
}

/**
 * Cada botón es opcional: se carga por desarrollo desde el backoffice (panel "Enlaces
 * opcionales" en DesarrolloForm). Si no tiene URL cargada, el botón directamente no se
 * renderiza — "Solicitar información" es la excepción, que cae al ancla interna
 * #contacto cuando no hay una URL propia.
 */
export function DesarrolloAccionesBotones({ desarrollo, onSolicitarInfo }: DesarrolloAccionesBotonesProps) {
  return (
    <div className="modal-botones">
      {desarrollo.showroomVirtualUrl && (
        <a href={desarrollo.showroomVirtualUrl} target="_blank" rel="noreferrer" className="modal-btn">
          <div className="btn-icono">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7l9-4 9 4M3 7l9 4 9-4M12 11v8" />
            </svg>
          </div>
          <div className="btn-textos">
            <span className="btn-titulo">Showroom virtual</span>
            <span className="btn-sub">Recorré la unidad en 360°</span>
          </div>
        </a>
      )}

      {desarrollo.brochurePlanosUrl && (
        <a href={desarrollo.brochurePlanosUrl} target="_blank" rel="noreferrer" className="modal-btn">
          <div className="btn-icono">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <div className="btn-textos">
            <span className="btn-titulo">Brochure / Planos</span>
            <span className="btn-sub">Descargar material comercial</span>
          </div>
        </a>
      )}

      {desarrollo.avanceObraUrl && (
        <a href={desarrollo.avanceObraUrl} target="_blank" rel="noreferrer" className="modal-btn modal-btn-obra">
          <div className="btn-icono">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
          <div className="btn-textos">
            <span className="btn-titulo">Avance de obra</span>
            <span className="btn-sub">Ver fotos actualizadas</span>
          </div>
        </a>
      )}

      <a
        href={desarrollo.solicitarInformacionUrl || `${ROUTES.home}#contacto`}
        target={desarrollo.solicitarInformacionUrl ? '_blank' : undefined}
        rel={desarrollo.solicitarInformacionUrl ? 'noreferrer' : undefined}
        className="modal-btn modal-btn-primary"
        onClick={desarrollo.solicitarInformacionUrl ? undefined : onSolicitarInfo}
      >
        <div className="btn-icono">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="btn-textos">
          <span className="btn-titulo">Solicitar información</span>
          <span className="btn-sub">Hablar con un asesor</span>
        </div>
      </a>
    </div>
  )
}
