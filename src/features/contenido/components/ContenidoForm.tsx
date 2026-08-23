import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import bo from '@/styles/backoffice.module.css'
import { ErrorDisplay } from '@/shared/components/ErrorDisplay'
import type { EnhancedErrorResponse } from '@/shared/api/errorSchema'
import type { Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'
import {
  CATEGORIAS_CONTENIDO,
  CATEGORIA_LABELS,
  contenidoFormSchema,
  emptyContenidoForm,
  type ContenidoFormValues,
} from '../schemas/contenido.schema'
import type { DriveFile } from '../schemas/drive.schema'
import { UploadZone } from './UploadZone'
import { DriveSourcePanel } from './DriveSourcePanel'

interface ContenidoFormProps {
  desarrollos: Desarrollo[]
  isLoading?: boolean
  error?: EnhancedErrorResponse | null
  onSubmit: (values: ContenidoFormValues, archivo: File | null) => void
}

export function ContenidoForm({ desarrollos, isLoading, error, onSubmit }: ContenidoFormProps) {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [driveFile, setDriveFile] = useState<DriveFile | null>(null)
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContenidoFormValues>({
    resolver: zodResolver(contenidoFormSchema),
    defaultValues: emptyContenidoForm(),
  })
  const tipo = watch('tipo')
  const origen = watch('origen')

  // Sin esto, cambiar de modo (foto/video, Drive/archivo) deja un fileId viejo cargado
  // que se postearía en silencio si el usuario después vuelve a "Drive" sin re-elegir.
  useEffect(() => {
    setDriveFile(null)
    setValue('driveFileId', null)
  }, [tipo, origen, setValue])

  const submit = handleSubmit((values) => {
    onSubmit(values, archivo)
    reset({ ...emptyContenidoForm(), tipo: values.tipo, origen: values.origen })
    setArchivo(null)
    setDriveFile(null)
  })

  return (
    <form onSubmit={submit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.75rem', alignItems: 'start', marginBottom: '2.5rem' }}>
        <div className={bo.panelPadded}>
          <div className={bo.sectionEyebrow}>Tipo de contenido</div>
          <Controller
            name="tipo"
            control={control}
            render={({ field }) => (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.9rem' }}>
                <button
                  type="button"
                  className={`${bo.btnToggle} ${field.value === 'foto' ? bo.btnToggleActive : ''}`}
                  onClick={() => field.onChange('foto')}
                >
                  Foto
                </button>
                <button
                  type="button"
                  className={`${bo.btnToggle} ${field.value === 'video' ? bo.btnToggleActive : ''}`}
                  onClick={() => field.onChange('video')}
                >
                  Video
                </button>
              </div>
            )}
          />

          <Controller
            name="origen"
            control={control}
            render={({ field }) => (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  className={`${bo.btnToggle} ${field.value === 'drive' ? bo.btnToggleActive : ''}`}
                  onClick={() => field.onChange('drive')}
                >
                  Desde Google Drive
                </button>
                <button
                  type="button"
                  className={`${bo.btnToggle} ${field.value === 'archivo' ? bo.btnToggleActive : ''}`}
                  onClick={() => field.onChange('archivo')}
                >
                  {tipo === 'video' ? 'URL externa' : 'Subir archivo'}
                </button>
              </div>
            )}
          />

          <div className={bo.field}>
            <label className={bo.label}>Título</label>
            <input className={bo.input} placeholder="Ej: Fachada frontal — obra terminada" {...register('titulo')} />
            {errors.titulo && <p className={bo.errorText}>{errors.titulo.message}</p>}
          </div>

          <div className={bo.fieldGrid2}>
            <div>
              <label className={bo.label}>Desarrollo asociado *</label>
              <Controller
                name="desarrolloId"
                control={control}
                render={({ field }) => (
                  <select
                    className={bo.select}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Seleccionar desarrollo...</option>
                    {desarrollos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.desarrolloId && <p className={bo.errorText}>{errors.desarrolloId.message}</p>}
            </div>
            <div>
              <label className={bo.label}>Categoría</label>
              <select className={bo.select} defaultValue="fachada" {...register('categoria')}>
                {CATEGORIAS_CONTENIDO.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIA_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={bo.field}>
            <label className={bo.label}>Descripción / texto alternativo</label>
            <textarea className={bo.textarea} rows={3} placeholder="Breve descripción para accesibilidad y SEO..." {...register('descripcion')} />
          </div>

          {tipo === 'video' && origen === 'archivo' && (
            <div className={bo.field}>
              <label className={bo.label}>URL de video (YouTube / Vimeo)</label>
              <input className={bo.input} placeholder="https://..." {...register('videoUrl')} />
              {errors.videoUrl && <p className={bo.errorText}>{errors.videoUrl.message}</p>}
            </div>
          )}

          <label className={bo.checkboxLabel} style={{ marginBottom: 0 }}>
            <input type="checkbox" {...register('esPortada')} />
            Usar como imagen de portada del desarrollo
          </label>
        </div>

        <div className={bo.panelPadded}>
          <div className={bo.sectionEyebrow}>
            {origen === 'drive'
              ? tipo === 'video'
                ? 'Video de Drive'
                : 'Foto de Drive'
              : tipo === 'video'
                ? 'Vista previa de video'
                : 'Archivo'}
          </div>
          {origen === 'drive' ? (
            <DriveSourcePanel
              familia={tipo}
              file={driveFile}
              disabled={isLoading}
              onChange={(file) => {
                setDriveFile(file)
                setValue('driveFileId', file?.id ?? null, { shouldValidate: true })
              }}
            />
          ) : tipo === 'video' ? (
            <div
              style={{
                width: '100%',
                height: 220,
                border: '1px dashed #2a2a2a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                background: '#080808',
              }}
            >
              <span style={{ fontSize: '2rem', color: '#555555' }}>▶</span>
              <span style={{ fontSize: '0.78rem', color: '#666666', textAlign: 'center', padding: '0 1.5rem' }}>
                La miniatura se genera desde la URL del video
              </span>
            </div>
          ) : (
            <UploadZone file={archivo} onChange={setArchivo} disabled={isLoading} />
          )}
          {origen === 'drive' && errors.driveFileId && <p className={bo.errorText}>{errors.driveFileId.message}</p>}
        </div>
      </div>

      <ErrorDisplay error={error} className={bo.field} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
        <button type="submit" className={bo.btnPrimary} disabled={isLoading}>
          Agregar contenido
        </button>
      </div>
    </form>
  )
}
