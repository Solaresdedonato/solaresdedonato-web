import { useMemo, useState } from 'react'
import bo from '@/styles/backoffice.module.css'
import { LoadingScreen } from '@/shared/components/LoadingScreen'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorDisplay } from '@/shared/components/ErrorDisplay'
import { formatBytes } from '@/shared/utils/formatBytes'
import { useDriveArchivos, useDriveThumbnail } from '../hooks/useDrive'
import { familiaDriveArchivo, type DriveFile } from '../schemas/drive.schema'

interface DriveFileTileProps {
  file: DriveFile
  soportado: boolean
  selected: boolean
  onClick: () => void
}

function DriveFileTile({ file, soportado, selected, onClick }: DriveFileTileProps) {
  // yaImportado deshabilitado también: el backend lo rechaza con 409 igual, mejor
  // no dejar elegir algo que va a fallar al enviar.
  const disabled = !soportado || file.yaImportado
  const thumbUrl = useDriveThumbnail(soportado ? file.miniaturaUrl : null)

  return (
    <button
      type="button"
      className={`${bo.mediaTile} ${selected ? bo.mediaTileSelected : ''}`}
      aria-pressed={selected}
      disabled={disabled}
      title={
        file.yaImportado
          ? `${file.nombre} — ya está en la biblioteca`
          : soportado
            ? file.nombre
            : `${file.nombre} — tipo de archivo no soportado`
      }
      onClick={onClick}
    >
      <div className={bo.mediaTileThumbWrap}>
        {thumbUrl ? (
          <img className={bo.mediaThumb} src={thumbUrl} alt={file.nombre} />
        ) : (
          <div className={bo.mediaThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '1.6rem', color: '#555555' }}>{file.mimeType.startsWith('video/') ? '▶' : '▨'}</span>
          </div>
        )}
        {file.yaImportado && <span className={bo.mediaTileBadge}>En biblioteca</span>}
      </div>
      <div className={bo.mediaTileBody}>
        <div className={bo.mediaTileName}>{file.nombre}</div>
        <div className={bo.mediaTileMeta}>{file.tamanioBytes != null ? formatBytes(file.tamanioBytes) : '—'}</div>
      </div>
    </button>
  )
}

interface DrivePickerModalProps {
  open: boolean
  /** Qué familia de archivo mostrar como elegible — el resto de la carpeta igual se ve
   *  (para que quede claro qué hay), pero gris y deshabilitado. */
  familia: 'foto' | 'video'
  onClose: () => void
  onSelect: (file: DriveFile) => void
}

export function DrivePickerModal({ open, familia, onClose, onSelect }: DrivePickerModalProps) {
  const [busqueda, setBusqueda] = useState('')
  const [seleccionado, setSeleccionado] = useState<DriveFile | null>(null)
  const { data, isLoading, isFetching, error, refetch } = useDriveArchivos(open)

  // Sin efecto de reset (react-hooks/set-state-in-effect): DriveSourcePanel remonta
  // este componente con un key distinto cada vez que abre el modal, así que
  // busqueda/seleccionado ya nacen limpios por el useState de arriba.

  // Filtro client-side: una sola llamada a Drive por apertura del modal, no una por
  // tecla — la cuota de la Drive API es de proyecto, no vale la pena gastarla acá.
  const filtrados = useMemo(() => {
    const archivos = data?.archivos ?? []
    const termino = busqueda.trim().toLowerCase()
    return termino ? archivos.filter((a) => a.nombre.toLowerCase().includes(termino)) : archivos
  }, [data, busqueda])

  if (!open) return null

  return (
    <div className={bo.modalOverlay} onClick={onClose}>
      <div className={bo.modalDialogWide} onClick={(e) => e.stopPropagation()}>
        <div className={bo.modalHeader}>
          <h2 className={bo.panelHeaderTitle}>{familia === 'video' ? 'Videos en Google Drive' : 'Fotos en Google Drive'}</h2>
          <button type="button" className={bo.btnGhost} disabled={isFetching} onClick={() => refetch()}>
            Actualizar
          </button>
        </div>

        <div className={bo.modalBody}>
          <div className={bo.field}>
            <input
              className={bo.input}
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {isLoading ? (
            <LoadingScreen />
          ) : error ? (
            <>
              <ErrorDisplay error={error} className={bo.field} />
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button type="button" className={bo.btnOutline} onClick={() => refetch()}>
                  Reintentar
                </button>
              </div>
            </>
          ) : filtrados.length === 0 ? (
            <EmptyState message="No hay archivos en la carpeta de Drive." />
          ) : (
            <div className={bo.mediaGrid}>
              {filtrados.map((archivo) => (
                <DriveFileTile
                  key={archivo.id}
                  file={archivo}
                  soportado={familiaDriveArchivo(archivo.mimeType) === familia}
                  selected={seleccionado?.id === archivo.id}
                  onClick={() => setSeleccionado(archivo)}
                />
              ))}
            </div>
          )}
        </div>

        <div className={bo.modalFooter}>
          <button type="button" className={bo.btnGhost} onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className={bo.btnPrimary}
            disabled={!seleccionado}
            onClick={() => seleccionado && onSelect(seleccionado)}
          >
            Elegir
          </button>
        </div>
      </div>
    </div>
  )
}
