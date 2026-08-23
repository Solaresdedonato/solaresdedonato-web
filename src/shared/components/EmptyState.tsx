interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666666', fontSize: '0.85rem' }}>{message}</div>
  )
}
