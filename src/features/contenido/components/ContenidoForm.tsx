import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import bo from '@/styles/backoffice.module.css'
import { ErrorDisplay } from '@/shared/components/ErrorDisplay'
import { useDriveThumbnail } from '../hooks/useDrive'
import { useGuardarContenido } from '../hooks/useGuardarContenido'
import { useGuardarContenidoLote, type LoteResultado } from '../hooks/useGuardarContenidoLote'
import type { Desarrollo } from '@/features/desarrollo/schemas/desarrollo.schema'
import {
  CATEGORIAS_SELECCIONABLES,
  CATEGORIA_LABELS,
  contenidoFormSchema,
  emptyContenidoForm,
  type ContenidoFormValues,
} from '../schemas/contenido.schema'
import type { DriveFile } from '../schemas/drive.schema'
import { MultiUploadZone } from './MultiUploadZone'
import { DriveSourcePanel } from './DriveSourcePanel'
import { DrivePickerModal } from './DrivePickerModal'

interface ContenidoFormProps {
  /** Este contenido siempre se carga en el contexto de un desarrollo puntual (se llega
   *  acá desde su ficha de edición) — no hay picker, el desarrollo ya está fijado. */
  desarrollo: Desarrollo
}

function DriveChip({ file, disabled, onRemove }: { file: DriveFile; disabled?: boolean; onRemove: () => void }) {
  const thumbUrl = useDriveThumbnail(file.miniaturaUrl)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        background: '#111111',
        border: '1px solid #2a2a2a',
        padding: '0.5rem 0.9rem',
      }}
    >
      {thumbUrl ? (
        <img src={thumbUrl} alt={file.nombre} style={{ width: 36, height: 36, objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <div style={{ width: 36, height: 36, background: '#1a1a1a', flexShrink: 0 }} />
      )}
      <span style={{ fontSize: '0.85rem', color: '#f5f0e8', flex: 1, wordBreak: 'break-all' }}>{file.nombre}</span>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        style={{ background: 'none', border: 'none', color: '#b8895a', cursor: 'pointer', fontSize: '0.85rem' }}
      >
        ✕
      </button>
    </div>
  )
}

export function ContenidoForm({ desarrollo }: ContenidoFormProps) {
  const [archivos, setArchivos] = useState<File[]>([])
  const [driveFilesLote, setDriveFilesLote] = useState<DriveFile[]>([])
  const [driveFileVideo, setDriveFileVideo] = useState<DriveFile | null>(null)
  const [pickerAbierto, setPickerAbierto] = useState(false)
  const [seleccionError, setSeleccionError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<LoteResultado | null>(null)

  const { guardar: guardarVideo, isLoading: guardandoVideo, error: errorVideo } = useGuardarContenido()
  const { guardarLote, isLoading: guardandoLote } = useGuardarContenidoLote()
  const isLoading = guardandoVideo || guardandoLote

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
    defaultValues: { ...emptyContenidoForm(), desarrolloId: desarrollo.id },
  })
  const tipo = watch('tipo')
  const origen = watch('origen')

  // Sin esto, cambiar de modo (foto/video, Drive/archivo) deja selección vieja cargada
  // que se postearía en silencio si el usuario después vuelve a un modo ya usado.
  useEffect(() => {
    setDriveFileVideo(null)
    setValue('driveFileId', null)
    setArchivos([])
    setDriveFilesLote([])
    setSeleccionError(null)
    setResultado(null)
  }, [tipo, origen, setValue])

  const resetForm = (values: ContenidoFormValues) => {
    reset({ ...emptyContenidoForm(), desarrolloId: desarrollo.id, tipo: values.tipo, origen: values.origen })
    setArchivos([])
    setDriveFilesLote([])
    setDriveFileVideo(null)
  }

  const submit = handleSubmit(async (values) => {
    if (values.tipo === 'foto') {
      if (values.origen === 'archivo' && archivos.length === 0) {
        setSeleccionError('Elegí al menos una foto')
        return
      }
      if (values.origen === 'drive' && driveFilesLote.length === 0) {
        setSeleccionError('Elegí al menos una foto de Drive')
        return
      }
      setSeleccionError(null)
      setResultado(null)
      const r = await guardarLote({ form: values, archivos, driveFiles: driveFilesLote })
      setResultado(r)
      if (r.fallidos.length === 0) {
        resetForm(values)
      } else {
        // No borrar todo: solo sacar de la selección lo que sí se subió, para que
        // reintentar el envío no vuelva a mandar (duplicando) lo que ya entró bien.
        const nombresFallidos = new Set(r.fallidos.map((f) => f.nombre))
        setArchivos((prev) => prev.filter((f) => nombresFallidos.has(f.name)))
        setDriveFilesLote((prev) => prev.filter((f) => nombresFallidos.has(f.nombre)))
      }
      return
    }

    guardarVideo({ form: values, archivo: null })
    resetForm(values)
  })

  const cantidadElegida = origen === 'drive' ? driveFilesLote.length : archivos.length

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
            <label className={bo.label}>{tipo === 'foto' ? 'Prefijo de título (opcional)' : 'Título'}</label>
            <input
              className={bo.input}
              placeholder={tipo === 'foto' ? 'Ej: Fachada (se agrega antes del nombre de cada archivo)' : 'Ej: Recorrido en drone'}
              {...register('titulo')}
            />
            {errors.titulo && <p className={bo.errorText}>{errors.titulo.message}</p>}
          </div>

          <div className={bo.fieldGrid2}>
            <div>
              <label className={bo.label}>Desarrollo asociado</label>
              <div className={bo.input} style={{ display: 'flex', alignItems: 'center', color: '#999999' }}>
                {desarrollo.nombre}
              </div>
            </div>
            <div>
              <label className={bo.label}>Categoría</label>
              <select className={bo.select} defaultValue="fachada" {...register('categoria')}>
                {CATEGORIAS_SELECCIONABLES.map((c) => (
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
            {tipo === 'foto' && cantidadElegida > 1
              ? 'Usar la primera foto como portada del desarrollo'
              : 'Usar como imagen de portada del desarrollo'}
          </label>
        </div>

        <div className={bo.panelPadded}>
          <div className={bo.sectionEyebrow}>
            {origen === 'drive'
              ? tipo === 'video'
                ? 'Video de Drive'
                : `Fotos de Drive${driveFilesLote.length > 0 ? ` (${driveFilesLote.length})` : ''}`
              : tipo === 'video'
                ? 'Vista previa de video'
                : `Archivos${archivos.length > 0 ? ` (${archivos.length})` : ''}`}
          </div>

          {tipo === 'video' ? (
            origen === 'drive' ? (
              <DriveSourcePanel
                familia="video"
                file={driveFileVideo}
                disabled={isLoading}
                onChange={(file) => {
                  setDriveFileVideo(file)
                  setValue('driveFileId', file?.id ?? null, { shouldValidate: true })
                }}
              />
            ) : (
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
            )
          ) : origen === 'drive' ? (
            <div>
              <button type="button" className={bo.btnOutline} disabled={isLoading} onClick={() => setPickerAbierto(true)}>
                Elegir de Drive
              </button>
              {driveFilesLote.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {driveFilesLote.map((f) => (
                    <DriveChip
                      key={f.id}
                      file={f}
                      disabled={isLoading}
                      onRemove={() => setDriveFilesLote((prev) => prev.filter((x) => x.id !== f.id))}
                    />
                  ))}
                </div>
              )}
              {/* key fuerza remount cada apertura: DrivePickerModal no resetea
                  búsqueda/selección internamente, asume que quien lo usa lo remonta
                  (mismo patrón que DriveSourcePanel). */}
              <DrivePickerModal
                key={pickerAbierto ? 'abierto' : 'cerrado'}
                open={pickerAbierto}
                familia="foto"
                multiple
                onClose={() => setPickerAbierto(false)}
                onSelectMultiple={(files) => {
                  setDriveFilesLote((prev) => {
                    const existentes = new Set(prev.map((f) => f.id))
                    return [...prev, ...files.filter((f) => !existentes.has(f.id))]
                  })
                  setPickerAbierto(false)
                }}
              />
            </div>
          ) : (
            <MultiUploadZone files={archivos} onChange={setArchivos} disabled={isLoading} />
          )}
          {seleccionError && <p className={bo.errorText}>{seleccionError}</p>}
          {tipo === 'video' && origen === 'drive' && errors.driveFileId && <p className={bo.errorText}>{errors.driveFileId.message}</p>}
        </div>
      </div>

      {tipo === 'video' && <ErrorDisplay error={errorVideo} className={bo.field} />}

      {resultado && (
        <div className={bo.field}>
          <p style={{ color: resultado.fallidos.length === 0 ? '#8fbf8f' : '#eabc7b', fontSize: '0.85rem' }}>
            {resultado.exitosos} foto{resultado.exitosos === 1 ? '' : 's'} agregada{resultado.exitosos === 1 ? '' : 's'} correctamente
            {resultado.fallidos.length > 0 && `, ${resultado.fallidos.length} con error`}.
          </p>
          {resultado.fallidos.map((f, i) => (
            <p key={i} className={bo.errorText}>
              {f.nombre}: {f.mensaje}
            </p>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
        <button type="submit" className={bo.btnPrimary} disabled={isLoading}>
          {isLoading
            ? 'Agregando…'
            : tipo === 'foto' && cantidadElegida > 1
              ? `Agregar ${cantidadElegida} fotos`
              : 'Agregar contenido'}
        </button>
      </div>
    </form>
  )
}
