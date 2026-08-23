import { useState } from 'react'

const AMBIENTES = ['1', '2', '3', '4'] as const
const ZONAS = ['Palermo', 'Villa Luro', 'Pinamar'] as const

const WHATSAPP_NUMBER = '5491151407693'

export function QuickLeadForm() {
  const [ambientes, setAmbientes] = useState<string[]>([])
  const [zona, setZona] = useState<string>('')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')

  const toggleAmbiente = (a: string) => {
    setAmbientes((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const partes = [
      'Hola, quiero información sobre desarrollos.',
      ambientes.length ? `Busco departamentos de ${ambientes.join(', ')} ambiente(s).` : null,
      zona ? `Mi zona de preferencia es ${zona}.` : null,
      nombre ? `Mi nombre es ${nombre}.` : null,
      email ? `Mi email es ${email}.` : null,
      telefono ? `Mi teléfono es ${telefono}.` : null,
    ].filter(Boolean)
    const texto = encodeURIComponent(partes.join(' '))
    window.open(`https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${texto}`, '_blank', 'noreferrer')
  }

  return (
    <form className="cta-quick-form" onSubmit={handleSubmit}>
      <h3 className="form-quick-title">Completá el formulario</h3>

      <div className="quick-question">
        <span className="quick-q-label">
          ¿Qué tipo de departamento buscás? <span className="hint-multi">(podés elegir más de uno)</span>
        </span>
        <div className="quick-options">
          {AMBIENTES.map((a) => (
            <label className="quick-check" key={a}>
              <input type="checkbox" checked={ambientes.includes(a)} onChange={() => toggleAmbiente(a)} />
              <span className="check-square">✓</span>
              <span className="radio-text">
                {a} ambiente{a !== '1' ? 's' : ''}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="quick-question">
        <span className="quick-q-label">¿Cuál es tu zona de preferencia?</span>
        <div className="quick-options">
          {ZONAS.map((z) => (
            <label className="quick-radio" key={z}>
              <input type="radio" name="zona" checked={zona === z} onChange={() => setZona(z)} />
              <span className="radio-mark" />
              <span className="radio-text">{z}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="quick-inputs">
        <input
          className="quick-input"
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input className="quick-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="quick-phone-wrap">
          <span className="quick-flag">🇦🇷</span>
          <input
            className="quick-input quick-phone"
            type="tel"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </div>
      </div>

      <button type="submit" className="btn-quick">
        Quiero más información
      </button>
      <p className="quick-legal">Al enviar aceptás ser contactado por nuestro equipo comercial. No compartimos tus datos.</p>
    </form>
  )
}
