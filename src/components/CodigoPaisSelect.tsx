import { CODIGOS_PAIS, codigoDePais, type IsoPais } from '@/shared/utils/telefono'

interface CodigoPaisSelectProps {
  value: IsoPais
  onChange: (iso: IsoPais) => void
}

/**
 * Dropdown del código de país, al lado del input de teléfono. Cerrado muestra solo el
 * código (+54); el <select> nativo va encima, transparente, así que al abrirlo se ve la
 * lista con el nombre de cada país (estilos en .codigo-pais, original-landing.css).
 */
export function CodigoPaisSelect({ value, onChange }: CodigoPaisSelectProps) {
  return (
    <div className="codigo-pais">
      <span aria-hidden="true">{codigoDePais(value)}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <select
        className="codigo-pais-select"
        aria-label="Código de país"
        value={value}
        onChange={(e) => onChange(e.target.value as IsoPais)}
      >
        {CODIGOS_PAIS.map((p) => (
          <option key={p.iso} value={p.iso}>
            {p.pais} ({p.codigo})
          </option>
        ))}
      </select>
    </div>
  )
}
