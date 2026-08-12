import { execute } from './db'

function formatDateTimeForDb(value?: string | Date | null) {
  if (!value) return null
  const date = typeof value === 'string' ? new Date(value) : value
  if (!date || Number.isNaN(date.getTime())) return null
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  const ss = pad(date.getSeconds())
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

export type AuditLogPayload = {
  openid: string
  type: 'table' | 'order' | 'system' | string
  target: string
  targetId?: number | null
  content: string
}

export async function createAuditLog({ openid, type, target, targetId = null, content }: AuditLogPayload) {
  const createdAt = formatDateTimeForDb(new Date())
  await execute(
    'INSERT INTO audit_logs (openid, type, target, targetId, content, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [openid, type, target, targetId, content, createdAt]
  )
}
