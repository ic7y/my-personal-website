import { query, execute } from './db'
import { createAuditLog } from './logs'

type OrderStatus = 0 | 1 | 2 | 3

type Order = {
  id: number
  tableId: number
  tableNumber: string
  start: string | null
  end: string | null
  status: OrderStatus
  usedTime: string
  createdAt: string
  updatedAt: string
}

type OrderUpdatePayload = {
  start?: string | null
  end?: string | null
  status?: OrderStatus
}

type OrderWithLabel = Order & {
  statusLabel: string
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  0: '未开始',
  1: '已结束',
  2: '进行中',
  3: '未知',
}

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n)
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return null
  const date = typeof value === 'string' ? new Date(value) : value
  if (!date || Number.isNaN(date.getTime())) return null
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  return `${y}-${m}-${d} ${hh}:${mm}`
}

function normalizeDateTime(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const hh = pad(date.getHours())
  const mm = pad(date.getMinutes())
  const ss = pad(date.getSeconds())
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

function getStatusLabel(status: OrderStatus) {
  return STATUS_LABELS[status] ?? STATUS_LABELS[3]
}

function computeOrderStatus(start?: string | null, end?: string | null): OrderStatus {
  if (!start) return 0
  if (start && !end) return 2
  if (start && end) return 1
  return 3
}

function computeUsedMinutes(start?: string | null, end?: string | null) {
  const startDate = parseOrderDate(start)
  if (!startDate) return 0
  const endDate = end ? parseOrderDate(end) : new Date()
  if (!endDate) return 0
  const diff = Math.max(0, endDate.getTime() - startDate.getTime())
  return Math.floor(diff / 60000)
}

function formatUsedTime(start?: string | null, end?: string | null) {
  const minutesTotal = computeUsedMinutes(start, end)
  const hours = Math.floor(minutesTotal / 60)
  const minutes = minutesTotal % 60
  const parts: string[] = []
  if (hours) parts.push(`${hours}小时`)
  if (minutes || !hours) parts.push(`${minutes}分钟`)
  return parts.join('') || '0分钟'
}

function normalizeOrderRow(row: any): Order {
  const start = formatDateTime(row.start)
  const end = formatDateTime(row.end)
  const status = Number(row.status) as OrderStatus
  // 已结束：end - start；进行中：当前时间 - start（实时）；其他：用数据库保存值
  const usedTime = status === 1
    ? formatUsedTime(start, end)
    : status === 2
      ? formatUsedTime(start, null)
      : String(row.usedTime || formatUsedTime(start, end) || '0分钟')
  return {
    id: Number(row.id),
    tableId: Number(row.tableId),
    tableNumber: String(row.tableNumber),
    start,
    end,
    status,
    usedTime,
    createdAt: formatDateTime(row.createdAt) ?? '',
    updatedAt: formatDateTime(row.updatedAt) ?? '',
  }
}

function withLabel(order: Order): OrderWithLabel {
  return {
    ...order,
    statusLabel: getStatusLabel(order.status),
  }
}

function parseOrderDate(value?: string | null): Date | null {
  if (!value) return null
  const normalized = value.replace(' ', 'T')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

async function maybeFinalizeOrderRow(row: any): Promise<Order> {
  const order = normalizeOrderRow(row)
  if (order.end && order.status !== 1) {
    const endDate = parseOrderDate(order.end)
    if (endDate && Date.now() > endDate.getTime()) {
      const now = normalizeDateTime(new Date().toISOString()) || formatDateTime(new Date()) || ''
      // 归档为已结束时，把已使用时间(end - start)持久化到数据库
      const usedTime = formatUsedTime(order.start, order.end)
      await execute('UPDATE orders SET status = ?, usedTime = ?, updatedAt = ? WHERE id = ?', [1, usedTime, now, order.id])
      return {
        ...order,
        status: 1,
        usedTime,
        updatedAt: now,
      }
    }
  }
  return order
}

export async function getAllOrders() {
  const rows = await query('SELECT * FROM orders ORDER BY id ASC')
  const orders = await Promise.all(rows.map(maybeFinalizeOrderRow))
  return orders.map(withLabel)
}

export async function getOrdersByTableId(tableId: string | number) {
  const rows = await query('SELECT * FROM orders WHERE tableId = ? ORDER BY id ASC', [tableId])
  const orders = await Promise.all(rows.map(maybeFinalizeOrderRow))
  return orders.map(withLabel)
}

export async function getLatestOrderForTable(tableId: string | number) {
  const orders = await getOrdersByTableId(tableId)
  return orders.length ? orders[orders.length - 1] : null
}

export async function createOrder(payload: Partial<Order>, openid: string = 'unknown') {
  const now = normalizeDateTime(new Date().toISOString())
  const start = normalizeDateTime(payload.start ?? null)
  const end = normalizeDateTime(payload.end ?? null)
  const status = typeof payload.status === 'number' && [0, 1, 2, 3].includes(payload.status)
    ? payload.status
    : computeOrderStatus(payload.start ?? null, payload.end ?? null)
  const usedTime = formatUsedTime(start, end)
  const result = await execute(
    'INSERT INTO orders (tableId, tableNumber, start, end, status, usedTime, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [payload.tableId ?? 0, payload.tableNumber ?? String(payload.tableId ?? ''), start, end, status, usedTime, now, now]
  )
  const insertId = Number((result as any).insertId)
  await createAuditLog({
    openid,
    type: 'order',
    target: 'orders',
    targetId: insertId,
    content: `新增订单 tableId=${payload.tableId ?? 0} tableNumber=${payload.tableNumber ?? ''} start=${start ?? 'null'} end=${end ?? 'null'} status=${status}`,
  })
  const rows = await query('SELECT * FROM orders WHERE id = ?', [insertId])
  return withLabel(normalizeOrderRow(rows[0]))
}

export async function updateOrderById(orderId: number, payload: OrderUpdatePayload, openid: string = 'unknown') {
  const orderRows = await query('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderId])
  const row = orderRows[0]
  if (!row) return null
  const order = normalizeOrderRow(row)
  const updates: string[] = []
  const params: any[] = []
  if (payload.start !== undefined) {
    updates.push('start = ?')
    params.push(normalizeDateTime(payload.start))
  }
  if (payload.end !== undefined) {
    updates.push('end = ?')
    params.push(normalizeDateTime(payload.end))
  }
  if (payload.status !== undefined) {
    updates.push('status = ?')
    params.push(payload.status)
  }
  if (updates.length === 0) return order
  const nextStart = payload.start !== undefined ? normalizeDateTime(payload.start) : order.start
  const nextEnd = payload.end !== undefined ? normalizeDateTime(payload.end) : order.end
  const usedTime = formatUsedTime(nextStart, nextEnd)
  updates.push('usedTime = ?')
  params.push(usedTime)
  const updatedAt = normalizeDateTime(new Date().toISOString())
  updates.push('updatedAt = ?')
  params.push(updatedAt)
  params.push(orderId)
  await execute(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`, params)
  await createAuditLog({
    openid,
    type: 'order',
    target: 'orders',
    targetId: orderId,
    content: `修改订单 id=${orderId} ${updates.join(' ')}`,
  })
  const rows = await query('SELECT * FROM orders WHERE id = ?', [orderId])
  return withLabel(normalizeOrderRow(rows[0]))
}

export { getStatusLabel, computeOrderStatus }
