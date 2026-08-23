import { useState } from 'react'
import bo from '@/styles/backoffice.module.css'
import { LoadingScreen } from '@/shared/components/LoadingScreen'
import { EmptyState } from '@/shared/components/EmptyState'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { ErrorDisplay } from '@/shared/components/ErrorDisplay'
import { mediaUrl } from '@/shared/utils/mediaUrl'
import { DriveSourcePanel } from '@/features/contenido/components/DriveSourcePanel'
import { UploadZone } from '@/features/contenido/components/UploadZone'
import type { ContenidoFormValues, ContenidoMedia } from '@/features/contenido/schemas/contenido.schema'
import type { DriveFile } from '@/features/contenido/schemas/drive.schema'
import { useEliminarHeroSlide, useGuardarHeroSlide, useHeroSlides, useReordenarHero } from '../hooks/useHeroSlides'

/** Tab "Web" del backoffice: configuración del sitio público más allá de los
 *  desarrollos. Por ahora solo tiene el carrusel de inicio (hero); si se suman más
 *  secciones de sitio (footer, textos institucionales, etc.) van como paneles nuevos
 *  acá, no como tabs nuevas. */
export function WebPage() {
  const { data: slides, isLoading } = useHeroSlides()
  const { guardar, isLoading: guardando, error: errorGuardar } = useGuardarHeroSlide()
  const { eliminar, isLoading: eliminando, error: errorEliminar } = useEliminarHeroSlide()
  const { reordenar } = useReordenarHero()

  const [origen, setOrigen] = useState<'drive' | 'archivo'>('drive')
  const [driveFile, setDriveFile] = useState<DriveFile | null>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [titulo, setTitulo] = useState('')
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null)
  const [aEliminar, setAEliminar] = useState<ContenidoMedia | null>(null)

  const cambiarOrigen = (nuevo: 'drive' | 'archivo') => {
    setOrigen(nuevo)
    setDriveFile(null)
    setArchivo(null)
  }

  const submit = () => {
    if (!titulo.trim()) {
      setErrorValidacion('Ingresá una descripción para la imagen')
      return
    }
    if (origen === 'drive' && !driveFile) {
      setErrorValidacion('Elegí una foto de Drive')
      return
    }
    if (origen === 'archivo' && !archivo) {
      setErrorValidacion('Subí una foto')
      return
    }
    setErrorValidacion(null)

    const form: ContenidoFormValues = {
      tipo: 'foto',
      origen,
      driveFileId: driveFile?.id ?? null,
      titulo: titulo.trim(),
      desarrolloId: null,
      categoria: 'hero',
      descripcion: '',
      videoUrl: '',
      esPortada: false,
    }

    guardar(
      { form, archivo },
      {
        onSuccess: () => {
          setTitulo('')
          setDriveFile(null)
          setArchivo(null)
        },
      },
    )
  }

  const mover = (index: number, direccion: -1 | 1) => {
    if (!slides) return
    const destino = index + direccion
    if (destino < 0 || destino >= slides.length) return
    const nuevoOrden = [...slides]
    ;[nuevoOrden[index], nuevoOrden[destino]] = [nuevoOrden[destino], nuevoOrden[index]]
    reordenar(nuevoOrden.map((s) => s.id))
  }

  return (
    <div className={bo.page}>
      <div className={bo.breadcrumb}>Web / Carrusel de inicio</div>
      <h1 className={bo.pageTitle} style={{ marginBottom: '0.5rem' }}>
        Carrusel de inicio
      </h1>
      <p className={bo.hint} style={{ marginBottom: '2rem' }}>
        Estas son las fotos que rotan en el hero de la home. El orden de esta lista es el orden del carrusel.
      </p>

      <div className={bo.panelPadded} style={{ marginBottom: '2.5rem' }}>
        <div className={bo.sectionEyebrow}>Agregar imagen</div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`${bo.btnToggle} ${origen === 'drive' ? bo.btnToggleActive : ''}`}
            onClick={() => cambiarOrigen('drive')}
          >
            Desde Google Drive
          </button>
          <button
            type="button"
            className={`${bo.btnToggle} ${origen === 'archivo' ? bo.btnToggleActive : ''}`}
            onClick={() => cambiarOrigen('archivo')}
          >
            Subir archivo
          </button>
        </div>

        <div style={{ maxWidth: 480, marginBottom: '1.25rem' }}>
          {origen === 'drive' ? (
            <DriveSourcePanel familia="foto" file={driveFile} disabled={guardando} onChange={setDriveFile} />
          ) : (
            <UploadZone file={archivo} onChange={setArchivo} disabled={guardando} />
          )}
        </div>

        <div className={bo.field} style={{ maxWidth: 480 }}>
          <label className={bo.label}>Descripción (alt de la imagen)</label>
          <input
            className={bo.input}
            placeholder="Ej: Fachada Solares Pinamar al atardecer"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        {errorValidacion && <p className={bo.errorText}>{errorValidacion}</p>}
        <ErrorDisplay error={errorGuardar} className={bo.field} />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className={bo.btnPrimary} disabled={guardando} onClick={submit}>
            {guardando ? 'Agregando…' : 'Agregar al carrusel'}
          </button>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '2rem' }}>
        <h2 style={{ fontFamily: "'Titillium Web', sans-serif", fontWeight: 400, fontSize: '1.3rem', color: '#ffffff', margin: '0 0 1.5rem' }}>
          Imágenes cargadas ({slides?.length ?? 0})
        </h2>

        {isLoading ? (
          <LoadingScreen />
        ) : !slides?.length ? (
          <EmptyState message="Todavía no cargaste ninguna imagen para el carrusel de inicio." />
        ) : (
          <div className={bo.mediaGrid}>
            {slides.map((slide, index) => (
              <div key={slide.id} className={bo.mediaTile} style={{ cursor: 'default' }}>
                <div className={bo.mediaTileThumbWrap}>
                  <img className={bo.mediaThumb} src={mediaUrl(slide.archivoUrl)} alt={slide.titulo} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      left: '0.5rem',
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      color: '#eabc7b',
                      textTransform: 'uppercase',
                      background: 'rgba(8,8,8,0.7)',
                      padding: '0.2rem 0.5rem',
                    }}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className={bo.mediaTileBody}>
                  <div className={bo.mediaTileName}>{slide.titulo}</div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className={bo.editLink}
                        disabled={index === 0}
                        onClick={() => mover(index, -1)}
                        aria-label="Mover antes"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={bo.editLink}
                        disabled={index === slides.length - 1}
                        onClick={() => mover(index, 1)}
                        aria-label="Mover después"
                      >
                        ↓
                      </button>
                    </div>
                    <button type="button" className={bo.deleteLink} onClick={() => setAEliminar(slide)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!aEliminar}
        title="Eliminar imagen del carrusel"
        message={`¿Seguro que querés eliminar "${aEliminar?.titulo}" del carrusel de inicio?`}
        loading={eliminando}
        errorMessage={errorEliminar?.message}
        onCancel={() => setAEliminar(null)}
        onConfirm={() => {
          if (aEliminar) eliminar(aEliminar.id, { onSuccess: () => setAEliminar(null) })
        }}
      />
    </div>
  )
}
