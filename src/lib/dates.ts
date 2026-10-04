/*
  Converte os formatos de data usados no projeto
  (Timestamp do Firestore, Date, número ou texto)
  em um objeto Date.
*/
export function toDate(value: unknown): Date | null {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value === 'object') {
    const timestamp = value as { toDate?: () => Date; seconds?: number }

    if (typeof timestamp.toDate === 'function') return timestamp.toDate()
    if (typeof timestamp.seconds === 'number') return new Date(timestamp.seconds * 1000)
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

export function toMillis(value: unknown) {
  return toDate(value)?.getTime() ?? 0
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(value: unknown, fallback = 'Data não registrada') {
  const date = toDate(value)
  return date ? dateFormatter.format(date) : fallback
}

export function formatDateTime(value: unknown, fallback = 'Data não registrada') {
  const date = toDate(value)
  return date ? dateTimeFormatter.format(date).replace(',', ' às') : fallback
}
