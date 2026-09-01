import { useRef, useState, type DragEvent } from 'react'
import { formatBytes } from '@/shared/utils/formatBytes'

// Mismo allow-list que UploadZone/ValidadorArchivoImagen (jpg/png/webp/avif).
const ACCEPT = '.jpg,.jpeg,.png,.webp,.avif'
const ALLOWED_EXT = /\.(jpg|jpeg|png|webp|avif)$/i
const MAX_BYTES = 5 * 1024 * 1024

interface MultiUploadZoneProps {
  files: File[]
  onChange: (files: File[]) => void
  disabled?: boolean
}

/**
 * Igual que UploadZone pero para varios archivos a la vez: cada selección/drop se
 * ACUMULA a lo ya elegido (no lo reemplaza), para poder ir agregando fotos de a tandas.
 */
export function MultiUploadZone({ files, onChange, disabled }: MultiUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const validate = (f: File): string | null => {
    if (!ALLOWED_EXT.test(f.name)) return `"${f.name}" tiene una extensión no permitida`
    if (f.size > MAX_BYTES) return `"${f.name}" pesa ${formatBytes(f.size)}, excede el máximo ${formatBytes(MAX_BYTES)}`
    return null
  }

  const handleFiles = (incoming: FileList | null) => {
    if (disabled || !incoming || incoming.length === 0) return
    const nuevos: File[] = []
    let primerError: string | null = null
    for (const f of Array.from(incoming)) {
      const error = validate(f)
      if (error) {
        primerError = primerError ?? error
        continue
      }
      // Evita duplicar si se vuelve a elegir el mismo archivo dos veces.
      if (!files.some((existente) => existente.name === f.name && existente.size === f.size)) {
        nuevos.push(f)
      }
    }
    setErrorMsg(primerError)
    if (nuevos.length > 0) onChange([...files, ...nuevos])
  }

  const quitar = (index: number) => {
    onChange(files.filter((_, i) => i !== index))
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
          handleFiles(e.dataTransfer.files)
        }}
        style={{
          width: '100%',
          height: 160,
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
        <span style={{ fontSize: '1.6rem', color: '#555555' }}>▨</span>
        <span style={{ fontSize: '0.78rem', color: '#666666', textAlign: 'center', padding: '0 1.5rem' }}>
          Arrastrá una o varias fotos acá o hacé clic para seleccionar
        </span>
        <span style={{ fontSize: '0.68rem', color: '#444444' }}>JPG, PNG, WebP, AVIF · max 5 MB c/u</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          style={{ display: 'none' }}
          onChange={(e) => {
            handleFiles(e.target.files)
            e.target.value = ''
          }}
          disabled={disabled}
        />
      </div>

      {errorMsg && <p style={{ color: '#d97b7b', fontSize: '0.78rem', marginTop: '0.5rem' }}>{errorMsg}</p>}

      {files.length > 0 && (
        <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {files.map((f, index) => (
            <div
              key={`${f.name}-${f.size}-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: '#111111',
                border: '1px solid #2a2a2a',
                padding: '0.5rem 0.9rem',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: '#f5f0e8', flex: 1, wordBreak: 'break-all' }}>{f.name}</span>
              <span style={{ fontSize: '0.75rem', color: '#999999' }}>{formatBytes(f.size)}</span>
              <button
                type="button"
                onClick={() => quitar(index)}
                disabled={disabled}
                style={{ background: 'none', border: 'none', color: '#b8895a', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
