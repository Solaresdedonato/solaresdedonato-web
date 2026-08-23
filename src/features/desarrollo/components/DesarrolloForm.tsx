import { useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import bo from '@/styles/backoffice.module.css'
import { ROUTES } from '@/shared/router/routes'
import { ErrorDisplay } from '@/shared/components/ErrorDisplay'
import type { EnhancedErrorResponse } from '@/shared/api/errorSchema'
import { ESTADOS } from '../schemas/estados'
import {
  CERCANIAS_CATEGORIAS,
  ESTADOS_DESARROLLO,
  ESTADO_LABELS,
  emptyDesarrolloForm,
  type Desarrollo,
  type DesarrolloCercanias,
  type DesarrolloFormValues,
} from '../schemas/desarrollo.schema'

interface DesarrolloFormUiValues {
  nombre: string
  zona: string
  direccion: string
  estado: DesarrolloFormValues['estado']
  descripcion: string
  features: DesarrolloFormValues['features']
  cercaniasTexto: Record<keyof DesarrolloCercanias, string>
  instrumentoTokenizacion: boolean
  instrumentoRentaFija: boolean
  showroomVirtualUrl: string
  brochurePlanosUrl: string
  avanceObraUrl: string
  solicitarInformacionUrl: string
}

function toUiValues(desarrollo?: Desarrollo): DesarrolloFormUiValues {
  const base = desarrollo ?? emptyDesarrolloForm()
  return {
    nombre: base.nombre,
    zona: base.zona,
    direccion: base.direccion,
    estado: base.estado,
    descripcion: base.descripcion,
    features: base.features,
    cercaniasTexto: {
      educacion: base.cercanias.educacion.join('\n'),
      transporte: base.cercanias.transporte.join('\n'),
      comercios: base.cercanias.comercios.join('\n'),
      salud: base.cercanias.salud.join('\n'),
    },
    instrumentoTokenizacion: base.instrumentoTokenizacion,
    instrumentoRentaFija: base.instrumentoRentaFija,
    showroomVirtualUrl: base.showroomVirtualUrl ?? '',
    brochurePlanosUrl: base.brochurePlanosUrl ?? '',
    avanceObraUrl: base.avanceObraUrl ?? '',
    solicitarInformacionUrl: base.solicitarInformacionUrl ?? '',
  }
}

function toApiValues(ui: DesarrolloFormUiValues): DesarrolloFormValues {
  const splitLines = (text: string) =>
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

  const urlOrUndefined = (text: string) => text.trim() || undefined

  return {
    nombre: ui.nombre,
    zona: ui.zona,
    direccion: ui.direccion,
    estado: ui.estado,
    descripcion: ui.descripcion,
    features: ui.features,
    cercanias: {
      educacion: splitLines(ui.cercaniasTexto.educacion),
      transporte: splitLines(ui.cercaniasTexto.transporte),
      comercios: splitLines(ui.cercaniasTexto.comercios),
      salud: splitLines(ui.cercaniasTexto.salud),
    },
    instrumentoTokenizacion: ui.instrumentoTokenizacion,
    instrumentoRentaFija: ui.instrumentoRentaFija,
    showroomVirtualUrl: urlOrUndefined(ui.showroomVirtualUrl),
    brochurePlanosUrl: urlOrUndefined(ui.brochurePlanosUrl),
    avanceObraUrl: urlOrUndefined(ui.avanceObraUrl),
    solicitarInformacionUrl: urlOrUndefined(ui.solicitarInformacionUrl),
  }
}

interface DesarrolloFormProps {
  desarrollo?: Desarrollo
  isLoading?: boolean
  error?: EnhancedErrorResponse | null
  onSubmit: (values: DesarrolloFormValues, publicar: boolean) => void
}

export function DesarrolloForm({ desarrollo, isLoading, error, onSubmit }: DesarrolloFormProps) {
  const { register, handleSubmit, watch } = useForm<DesarrolloFormUiValues>({
    defaultValues: toUiValues(desarrollo),
  })

  const submit = (publicar: boolean) => handleSubmit((values) => onSubmit(toApiValues(values), publicar))()
  const previewNombre = watch('nombre')
  const previewZona = watch('zona')
  const previewEstado = watch('estado')
  const previewEstadoInfo = ESTADOS[previewEstado ?? 'en-venta']

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.75rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className={bo.panelPadded}>
            <div className={bo.sectionEyebrow}>Datos generales</div>

            <div className={bo.field}>
              <label className={bo.label}>Nombre del desarrollo</label>
              <input className={bo.input} placeholder="Ej: Solares Pinamar" {...register('nombre', { required: true })} />
            </div>

            <div className={bo.fieldGrid2}>
              <div>
                <label className={bo.label}>Zona</label>
                <input className={bo.input} placeholder="Ej: Palermo" {...register('zona', { required: true })} />
              </div>
              <div>
                <label className={bo.label}>Estado</label>
                <select className={bo.select} {...register('estado')}>
                  {ESTADOS_DESARROLLO.map((estado) => (
                    <option key={estado} value={estado}>
                      {ESTADO_LABELS[estado]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={bo.field}>
              <label className={bo.label}>Dirección</label>
              <input
                className={bo.input}
                placeholder="Ej: Blvd. Ameghino 349"
                {...register('direccion', { required: true })}
              />
            </div>

            <div>
              <label className={bo.label}>Descripción</label>
              <textarea
                className={bo.textarea}
                rows={4}
                placeholder="Descripción del desarrollo para la ficha pública..."
                {...register('descripcion', { required: true })}
              />
            </div>
          </div>

          <div className={bo.panelPadded}>
            <div className={bo.sectionEyebrow}>Características</div>
            {[0, 1, 2, 3].map((i) => (
              <div className={bo.field} key={i}>
                <label className={bo.label}>{desarrollo?.features[i]?.titulo ?? emptyDesarrolloForm().features[i].titulo}</label>
                <input className={bo.input} placeholder="Detalle..." {...register(`features.${i}.texto` as const, { required: true })} />
              </div>
            ))}
          </div>

          <div className={bo.panelPadded}>
            <div className={bo.sectionEyebrow}>Cercanías</div>
            <p className={bo.hint}>Un ítem por línea. Se muestran en la ficha pública del desarrollo, dentro de la pantalla de detalle.</p>
            {CERCANIAS_CATEGORIAS.map((cat) => (
              <div className={bo.field} key={cat.key}>
                <label className={bo.label}>{cat.titulo}</label>
                <textarea
                  className={bo.textarea}
                  rows={3}
                  placeholder={cat.placeholder}
                  {...register(`cercaniasTexto.${cat.key}` as const)}
                />
              </div>
            ))}
          </div>

          <div className={bo.panelPadded}>
            <div className={bo.sectionEyebrow}>Instrumentos de inversión disponibles</div>
            <label className={bo.checkboxLabel}>
              <input type="checkbox" {...register('instrumentoTokenizacion')} />
              Tokenización inmobiliaria
            </label>
            <label className={bo.checkboxLabel}>
              <input type="checkbox" {...register('instrumentoRentaFija')} />
              Renta fija mensual
            </label>
          </div>

          <div className={bo.panelPadded}>
            <div className={bo.sectionEyebrow}>Enlaces opcionales</div>
            <p className={bo.hint}>
              Direcciones a las que redirigen los botones de la ficha pública. Si se dejan vacías, ese botón no se
              muestra (excepto "Solicitar información", que por defecto lleva al formulario de contacto del sitio).
            </p>
            <div className={bo.field}>
              <label className={bo.label}>Showroom virtual</label>
              <input
                className={bo.input}
                type="url"
                placeholder="https://..."
                {...register('showroomVirtualUrl')}
              />
            </div>
            <div className={bo.field}>
              <label className={bo.label}>Brochure / Planos</label>
              <input
                className={bo.input}
                type="url"
                placeholder="https://..."
                {...register('brochurePlanosUrl')}
              />
            </div>
            <div className={bo.field}>
              <label className={bo.label}>Avance de obra</label>
              <input className={bo.input} type="url" placeholder="https://..." {...register('avanceObraUrl')} />
            </div>
            <div>
              <label className={bo.label}>Solicitar información</label>
              <input
                className={bo.input}
                type="url"
                placeholder="https://... (opcional, si no se completa usa el formulario de contacto)"
                {...register('solicitarInformacionUrl')}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className={bo.panelPadded}>
            <div className={bo.sectionEyebrow}>Vista previa</div>
            <div style={{ fontSize: '0.85rem', color: '#999999', lineHeight: 1.6 }}>
              <div style={{ color: '#f5f0e8', fontFamily: "'Titillium Web', sans-serif", fontSize: '1.15rem', marginBottom: '0.3rem' }}>
                {previewNombre || 'Nombre del desarrollo'}
              </div>
              <div>{previewZona || 'Zona'}</div>
              <span className={bo.badge} style={{ color: previewEstadoInfo.color, borderColor: previewEstadoInfo.border, marginTop: '0.6rem' }}>
                {previewEstadoInfo.label}
              </span>
            </div>
          </div>
          <div className={bo.panelPadded}>
            <div className={bo.sectionEyebrow}>Imágenes</div>
            {desarrollo ? (
              <>
                <p className={bo.hint}>La portada y la galería de fotos/videos de este desarrollo se administran acá.</p>
                <RouterLink to={ROUTES.backofficeDesarrolloContenido(desarrollo.id)} className={bo.btnOutline}>
                  Administrar contenido
                </RouterLink>
              </>
            ) : (
              <p className={bo.hint} style={{ marginBottom: 0 }}>
                Guardá el desarrollo para poder cargar fotos y videos.
              </p>
            )}
          </div>
        </div>
      </div>

      <ErrorDisplay error={error} className={bo.field} />

      <div className={bo.actionsRow}>
        <RouterLink to={ROUTES.backofficeDesarrollos} className={bo.btnGhost}>
          Cancelar
        </RouterLink>
        <button type="button" className={bo.btnOutline} disabled={isLoading} onClick={() => submit(false)}>
          Guardar borrador
        </button>
        <button type="button" className={bo.btnPrimary} disabled={isLoading} onClick={() => submit(true)}>
          Publicar desarrollo
        </button>
      </div>
    </div>
  )
}
