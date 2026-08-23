import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactoFormSchema, PROYECTOS_INTERES, type ContactoFormValues } from '../schemas/contacto.schema'
import { useEnviarContacto } from '../hooks/useEnviarContacto'

export function ContactoForm() {
  const { enviar, isLoading, error, isSuccess } = useEnviarContacto()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactoFormValues>({
    resolver: zodResolver(contactoFormSchema),
    defaultValues: { nombre: '', apellido: '', email: '', telefono: '', proyectoInteres: '', mensaje: '' },
  })

  return (
    <form className="form-contacto" onSubmit={handleSubmit((values) => enviar(values, { onSuccess: () => reset() }))} noValidate>
      <div className="input-grupo">
        <div className="campo">
          <label htmlFor="contacto-nombre">Nombre</label>
          <input id="contacto-nombre" placeholder="Tu nombre" {...register('nombre')} />
          {errors.nombre && <span style={{ color: '#d97b7b', fontSize: '0.72rem' }}>{errors.nombre.message}</span>}
        </div>
        <div className="campo">
          <label htmlFor="contacto-apellido">Apellido</label>
          <input id="contacto-apellido" placeholder="Tu apellido" {...register('apellido')} />
          {errors.apellido && <span style={{ color: '#d97b7b', fontSize: '0.72rem' }}>{errors.apellido.message}</span>}
        </div>
      </div>

      <div className="input-grupo">
        <div className="campo">
          <label htmlFor="contacto-email">Email</label>
          <input id="contacto-email" type="email" placeholder="tu@email.com" {...register('email')} />
          {errors.email && <span style={{ color: '#d97b7b', fontSize: '0.72rem' }}>{errors.email.message}</span>}
        </div>
        <div className="campo">
          <label htmlFor="contacto-telefono">Teléfono / WhatsApp</label>
          <input id="contacto-telefono" type="tel" placeholder="+54 9 11..." {...register('telefono')} />
          {errors.telefono && <span style={{ color: '#d97b7b', fontSize: '0.72rem' }}>{errors.telefono.message}</span>}
        </div>
      </div>

      <div className="campo">
        <label htmlFor="contacto-proyecto">Proyecto de interés</label>
        <select id="contacto-proyecto" {...register('proyectoInteres')}>
          <option value="">— Seleccioná un proyecto —</option>
          {PROYECTOS_INTERES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label htmlFor="contacto-mensaje">Mensaje</label>
        <textarea id="contacto-mensaje" placeholder="Contanos en qué podemos ayudarte..." {...register('mensaje')} />
        {errors.mensaje && <span style={{ color: '#d97b7b', fontSize: '0.72rem' }}>{errors.mensaje.message}</span>}
      </div>

      {isSuccess && (
        <p style={{ color: '#8fd19e', fontSize: '0.85rem' }}>¡Gracias! Recibimos tu consulta, te vamos a contactar a la brevedad.</p>
      )}
      {error && <p style={{ color: '#d97b7b', fontSize: '0.85rem' }}>{error.message}</p>}

      <button type="submit" className="btn-form" disabled={isLoading}>
        {isLoading ? 'Enviando…' : 'Enviar consulta'}
      </button>
    </form>
  )
}
