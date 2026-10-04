export function toDate(value: unknown): Date | null {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate()
  }
  if (typeof value === 'object' && value !== null && 'seconds' in value) {
    const seconds = Number((value as { seconds: unknown }).seconds)
    if (Number.isFinite(seconds)) return new Date(seconds * 1000)
  }
  const parsed = new Date(value as string | number)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatDate(value: unknown) {
  const date = toDate(value)
  return date ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date) : 'Data não disponível'
}
