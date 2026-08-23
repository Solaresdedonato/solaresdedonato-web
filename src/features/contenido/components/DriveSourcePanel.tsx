import { useState } from 'react'
import bo from '@/styles/backoffice.module.css'
import { useDriveThumbnail } from '../hooks/useDrive'
import { DrivePickerModal } from './DrivePickerModal'
import type { DriveFile } from '../schemas/drive.schema'

interface DriveSourcePanelProps {
  familia: 'foto' | 'video'
  file: DriveFile | null
  onChange: (file: DriveFile | null) => void
  disabled?: boolean
}

/**
 * Ocupa el mismo slot que <UploadZone> (foto) o el input de URL externa (video) en
 * ContenidoForm cuando origen === 'drive' — misma caja de 220px, mismo look, para que
 * cambiar de modo no reacomode el layout.
 */
export function DriveSourcePanel({ familia, file, onChange, disabled }: DriveSourcePanelProps) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const thumbUrl = useDriveThumbnail(file?.miniaturaUrl ?? null)

  return (
    <div>
      {!file ? (
        <div
          style={{
            width: '100%',
            height: 220,
            border: '1px dashed #2a2a2a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.9rem',
            background: '#080808',
          }}
        >
          <span style={{ fontSize: '2rem', color: '#555555' }}>{familia === 'video' ? '▶' : '▨'}</span>
          <span style={{ fontSize: '0.78rem', color: '#666666', textAlign: 'center', padding: '0 1.5rem' }}>
            {familia === 'video' ? 'Elegí un video de tu carpeta de Drive' : 'Elegí una foto de tu carpeta de Drive'}
          </span>
          <button type="button" className={bo.btnOutline} disabled={disabled} onClick={() => setModalAbierto(true)}>
            Elegir de Drive
          </button>
          {familia === 'video' && (
            <span style={{ fontSize: '0.68rem', color: '#555555', textAlign: 'center', padding: '0 1.5rem' }}>
              El video tiene que estar compartido en Drive como "cualquiera con el link"
            </span>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
            background: '#111111',
            border: '1px solid #2a2a2a',
            padding: '0.9rem',
          }}
        >
          {thumbUrl ? (
            <img src={thumbUrl} alt={file.nombre} style={{ width: 72, height: 72, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 72, height: 72, background: '#1a1a1a' }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', color: '#f5f0e8', wordBreak: 'break-all' }}>{file.nombre}</div>
            {file.yaImportado && (
              <div style={{ fontSize: '0.7rem', color: '#eabc7b', marginTop: '0.2rem' }}>
                Ya está en la biblioteca
              </div>
            )}
          </div>
          <button type="button" className={bo.editLink} disabled={disabled} onClick={() => setModalAbierto(true)}>
            Cambiar
          </button>
        </div>
      )}

      {/* key fuerza un remount cada vez que se abre: así busqueda/seleccionado nacen
          limpios sin necesitar un efecto de reset adentro del modal. */}
      <DrivePickerModal
        key={modalAbierto ? 'abierto' : 'cerrado'}
        open={modalAbierto}
        familia={familia}
        onClose={() => setModalAbierto(false)}
        onSelect={(archivo) => {
          onChange(archivo)
          setModalAbierto(false)
        }}
      />
    </div>
  )
}
