import { useRef, useState, type DragEvent } from 'react'
import { formatBytes } from '@/shared/utils/formatBytes'

// Mismo allow-list que ValidadorArchivoImagen en el backend (jpg/png/webp/avif) —
// SVG queda afuera a propósito: /media/** lo serviría same-origin con la API y un SVG
// puede ejecutar JavaScript (XSS almacenado). Ofrecerlo acá solo llevaría a un rechazo
// confuso del backend.
const ACCEPT = '.jpg,.jpeg,.png,.webp,.avif'
const ALLOWED_EXT = /\.(jpg|jpeg|png|webp|avif)$/i
const MAX_BYTES = 5 * 1024 * 1024

interface UploadZoneProps {
  file: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
}

export function UploadZone({ file, onChange, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const validate = (f: File): string | null => {
    if (!ALLOWED_EXT.test(f.name)) return `"${f.name}" tiene una extensión no permitida`
    if (f.size > MAX_BYTES) return `Tamaño ${formatBytes(f.size)} excede el máximo ${formatBytes(MAX_BYTES)}`
    return null
  }

  const handleFile = (f: File | undefined) => {
    if (disabled || !f) return
    const error = validate(f)
    setErrorMsg(error)
    if (!error) onChange(f)
  }

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault()
          setDragOver(false)
          handleFile(e.dataTransfer.files[0])
        }}
        style={{
          width: '100%',
          height: 220,
          border: `1px dashed ${dragOver ? '#eabc7b' : '#2a2a2a'}`,
          background: dragOver ? 'rgba(234,188,123,0.04)' : '#080808',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.6rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span style={{ fontSize: '2rem', color: '#555555' }}>▨</span>
        <span style={{ fontSize: '0.78rem', color: '#666666', textAlign: 'center', padding: '0 1.5rem' }}>
          Arrastrá la foto acá o hacé clic para seleccionar
        </span>
        <span style={{ fontSize: '0.68rem', color: '#444444' }}>JPG, PNG, WebP, AVIF · max 5 MB</span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
          disabled={disabled}
        />
      </div>

      {errorMsg && <p style={{ color: '#d97b7b', fontSize: '0.78rem', marginTop: '0.5rem' }}>{errorMsg}</p>}

      {file && (
        <div
          style={{
            marginTop: '0.6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: '#111111',
            border: '1px solid #2a2a2a',
            padding: '0.6rem 0.9rem',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#f5f0e8', flex: 1, wordBreak: 'break-all' }}>{file.name}</span>
          <span style={{ fontSize: '0.75rem', color: '#999999' }}>{formatBytes(file.size)}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            style={{ background: 'none', border: 'none', color: '#b8895a', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
