import type { EnhancedErrorResponse } from '../api/errorSchema'

interface ErrorDisplayProps {
  error: EnhancedErrorResponse | null | undefined
  className?: string
}

export function ErrorDisplay({ error, className }: ErrorDisplayProps) {
  if (!error) return null
  return (
    <div
      className={className}
      style={{
        background: 'rgba(216,115,115,0.08)',
        border: '1px solid rgba(216,115,115,0.4)',
        color: '#d97b7b',
        fontSize: '0.85rem',
        padding: '0.85rem 1.1rem',
      }}
    >
      {error.message}
    </div>
  )
}
