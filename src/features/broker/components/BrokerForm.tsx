import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  brokerFormSchema,
  EXPERIENCIAS_BROKER,
  OPERACIONES_CERRADAS,
  TIPOS_OPERACION,
  TIPO_OPERACION_LABELS,
  ZONAS_OPERACION,
  type BrokerFormValues,
} from '../schemas/broker.schema'
import { useEnviarBroker } from '../hooks/useEnviarBroker'

export function BrokerForm() {
  const { enviar, isLoading, error, isSuccess } = useEnviarBroker()
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BrokerFormValues>({
    resolver: zodResolver(brokerFormSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      inmobiliaria: '',
      matricula: '',
      experiencia: '',
      zonaOperacion: '',
      tipoOperaciones: [],
      operacionesCerradas: '',
      mensaje: '',
    },
  })

  return (
    <div className="broker-form">
      <div className="broker-form-header">
        <h3>Registro de broker</h3>
        <p>Completá tus datos y nuestro equipo te contactará para coordinar una reunión.</p>
      </div>

      <form onSubmit={handleSubmit((values) => enviar(values, { onSuccess: () => reset() }))} noValidate>
        <div className="broker-grupo">
          <div className="campo">
            <label htmlFor="broker-nombre">Nombre y apellido</label>
            <input id="broker-nombre" placeholder="Tu nombre completo" {...register('nombre')} />
          </div>
          <div className="campo">
            <label htmlFor="broker-email">Email profesional</label>
            <input id="broker-email" type="email" placeholder="email@inmobiliaria.com" {...register('email')} />
          </div>
        </div>
        <div className="broker-grupo">
          <div className="campo">
            <label htmlFor="broker-telefono">Teléfono / WhatsApp</label>
            <input id="broker-telefono" type="tel" placeholder="+54 9 11..." {...register('telefono')} />
          </div>
          <div className="campo">
            <label htmlFor="broker-inmobiliaria">Inmobiliaria / Empresa</label>
            <input id="broker-inmobiliaria" placeholder="Nombre de tu inmobiliaria" {...register('inmobiliaria')} />
          </div>
        </div>
        <div className="broker-grupo">
          <div className="campo">
            <label htmlFor="broker-matricula">Matrícula profesional</label>
            <input id="broker-matricula" placeholder="Ej. CUCICBA 12345" {...register('matricula')} />
          </div>
          <div className="campo">
            <label htmlFor="broker-experiencia">Años de experiencia</label>
            <select id="broker-experiencia" {...register('experiencia')}>
              <option value="">— Seleccioná —</option>
              {EXPERIENCIAS_BROKER.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="campo">
          <label htmlFor="broker-zona">Zona principal de operación</label>
          <select id="broker-zona" {...register('zonaOperacion')}>
            <option value="">— Seleccioná tu zona —</option>
            {ZONAS_OPERACION.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          {errors.zonaOperacion && <span style={{ color: '#d97b7b', fontSize: '0.72rem' }}>{errors.zonaOperacion.message}</span>}
        </div>

        <div className="campo">
          <label>Tipo de operaciones que más manejás</label>
          <Controller
            name="tipoOperaciones"
            control={control}
            render={({ field }) => (
              <div className="broker-checks">
                {TIPOS_OPERACION.map((tipo) => (
                  <label key={tipo} className="broker-check-item">
                    <input
                      type="checkbox"
                      checked={field.value.includes(tipo)}
                      onChange={(e) =>
                        field.onChange(e.target.checked ? [...field.value, tipo] : field.value.filter((t) => t !== tipo))
                      }
                    />
                    <span className="check-mark">✓</span>
                    {TIPO_OPERACION_LABELS[tipo]}
                  </label>
                ))}
              </div>
            )}
          />
        </div>

        <div className="campo">
          <label htmlFor="broker-operaciones">Operaciones cerradas en los últimos 12 meses</label>
          <select id="broker-operaciones" {...register('operacionesCerradas')}>
            <option value="">— Seleccioná —</option>
            {OPERACIONES_CERRADAS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="campo">
          <label htmlFor="broker-mensaje">Mensaje (opcional)</label>
          <textarea id="broker-mensaje" {...register('mensaje')} />
        </div>

        {isSuccess && <p style={{ color: '#8fd19e', fontSize: '0.85rem' }}>¡Gracias! Recibimos tu registro, un asesor se va a contactar con vos.</p>}
        {error && <p style={{ color: '#d97b7b', fontSize: '0.85rem' }}>{error.message}</p>}

        <button type="submit" className="btn-broker" disabled={isLoading}>
          {isLoading ? 'Enviando…' : 'Quiero ser broker asociado'}
        </button>
        <p className="broker-legal">
          Al enviar el formulario aceptás que un asesor de Solares de Donato se contacte con vos para evaluar la incorporación a
          nuestra red.
        </p>
      </form>
    </div>
  )
}
