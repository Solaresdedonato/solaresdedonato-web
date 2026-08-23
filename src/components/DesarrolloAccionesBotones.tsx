import { ROUTES } from '@/shared/router/routes'

interface DesarrolloAccionesBotonesProps {
  /** El botón "Solicitar información" navega a #contacto igual en el modal y en la
   *  página de detalle — esto es lo único que cambia entre los dos usos (el modal
   *  también necesita cerrarse antes de navegar). */
  onSolicitarInfo?: () => void
}

/**
 * Los 3 primeros botones son EXACTAMENTE como el HTML original: placeholders con
 * alert() nativo, sin funcionalidad real (showroom virtual, brochure y avance de obra
 * todavía no existen como features reales). Se replican tal cual a propósito, no se
 * "mejoran" en silencio — si en algún momento se quiere una versión real, es un
 * pedido aparte.
 */
export function DesarrolloAccionesBotones({ onSolicitarInfo }: DesarrolloAccionesBotonesProps) {
  return (
    <div className="modal-botones">
      <button type="button" className="modal-btn" onClick={() => alert('Próximamente se conectará al showroom virtual de este desarrollo')}>
        <div className="btn-icono">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M3 7l9-4 9 4M3 7l9 4 9-4M12 11v8" />
          </svg>
        </div>
        <div className="btn-textos">
          <span className="btn-titulo">Showroom virtual</span>
          <span className="btn-sub">Recorré la unidad en 360°</span>
        </div>
      </button>

      <button type="button" className="modal-btn" onClick={() => alert('Se descargará el brochure y los planos en PDF')}>
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
      </button>

      <button
        type="button"
        className="modal-btn modal-btn-obra"
        onClick={() => alert('Verás el avance de obra actualizado mes a mes')}
      >
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
      </button>

      <a href={`${ROUTES.home}#contacto`} className="modal-btn modal-btn-primary" onClick={onSolicitarInfo}>
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
