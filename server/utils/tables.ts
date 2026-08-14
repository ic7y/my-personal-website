import { query, execute } from './db'
import { createOrder, getAllOrders, getLatestOrderForTable, getOrdersByTableId, updateOrderById } from './orders'
import { saveQrCodePng } from './qrcode'
import { createAuditLog } from './logs'

type Table = {
  id: number
  tableNumber: string
  createdAt?: string | null
  updatedAt?: string | null
  qrcode_addr?: string
}

type TableUpdatePayload = {
  tableNumber?: string
  start?: string | null
  end?: string | null
}

function normalizeTable(table: Table): Table {
  return {
    ...table,
    qrcode_addr: table.qrcode_addr ?? '',
  }
}

function formatDbDate(value: any): string | undefined {
  if (value === null || value === undefined) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toISOString()
}

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

async function readData(): Promise<Table[]> {
  const rows = await query('SELECT * FROM `tables` ORDER BY id ASC')
  return rows.map((row) => normalizeTable({
    id: Number(row.id),
    tableNumber: String(row.tableNumber),
    createdAt: formatDbDate(row.createdAt),
    updatedAt: formatDbDate(row.updatedAt),
    qrcode_addr: String(row.qrcode_addr || ''),
  }))
}

function computeUsed(start?: string | null, end?: string | null) {
  if (!start) return { minutes: 0, formatted: '0分钟', days: 0, hours: 0, minutesOnly: 0 }
  const parse = (v?: string | null) => {
    if (!v) return NaN
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(v)) {
      return new Date(v.replace(/-/g, '/')).getTime()
    }
    const n = Date.parse(v)
    return Number.isNaN(n) ? NaN : n
  }
  const s = parse(start)
  if (Number.isNaN(s)) return { minutes: 0, formatted: '0分钟', days: 0, hours: 0, minutesOnly: 0 }
  const e = end ? parse(end) : Date.now()
  const diff = Math.max(0, e - s)
  const minutesTotal = Math.floor(diff / 60000)
  const days = Math.floor(minutesTotal / (60 * 24))
  const hours = Math.floor((minutesTotal % (60 * 24)) / 60)
  const minutes = minutesTotal % 60
  const parts: string[] = []
  if (days) parts.push(`${days}天`)
  if (hours) parts.push(`${hours}小时`)
  if (minutes) parts.push(`${minutes}分钟`)
  const formatted = parts.length ? parts.join('') : '0分钟'
  return { minutes: minutesTotal, formatted, days, hours, minutesOnly: minutesTotal }
}

export async function getAllTables() {
  const data = await readData()
  const orders = await getAllOrders()
  const latestOrdersByTable: Record<string, typeof orders[number]> = {}
  for (const order of orders) {
    const key = String(order.tableId)
    if (!latestOrdersByTable[key] || latestOrdersByTable[key].id < order.id) {
      latestOrdersByTable[key] = order
    }
  }
  return data.map((t) => {
    const currentOrder = latestOrdersByTable[String(t.id)] || null
    return {
      ...t,
      used: currentOrder ? computeUsed(currentOrder.start, currentOrder.end) : { minutes: 0, formatted: '0分钟', days: 0, hours: 0, minutesOnly: 0 },
      currentOrder,
      currentOrderStatus: currentOrder ? currentOrder.statusLabel : '无订单',
      currentOrderStatusCode: currentOrder ? currentOrder.status : 3,
    }
  })
}

export async function getTableById(id: string | number) {
  const identifier = String(id).trim()
  const rows = await query('SELECT * FROM `tables` WHERE id = ? OR tableNumber = ? LIMIT 1', [identifier, identifier])
  const row = rows[0]
  if (!row) return null
  const table = normalizeTable({
    id: Number(row.id),
    tableNumber: String(row.tableNumber),
    createdAt: formatDbDate(row.createdAt),
    updatedAt: formatDbDate(row.updatedAt),
    qrcode_addr: String(row.qrcode_addr || ''),
  })
  const orders = await getOrdersByTableId(table.id)
  const currentOrder = orders.length ? orders[orders.length - 1] : null
  return {
    ...table,
    used: currentOrder ? computeUsed(currentOrder.start, currentOrder.end) : { minutes: 0, formatted: '0分钟', days: 0, hours: 0, minutesOnly: 0 },
    orders,
    currentOrder,
    currentOrderStatus: currentOrder ? currentOrder.statusLabel : '无订单',
    currentOrderStatusCode: currentOrder ? currentOrder.status : 3,
  }
}

export async function createTable(payload: Partial<Table>, openid: string = 'unknown') {
  const createdAt = formatDateTimeForDb(new Date())
  const updatedAt = createdAt
  const tableNumber = payload.tableNumber ? String(payload.tableNumber) : ''
  const insertResult = await execute(
    'INSERT INTO `tables` (tableNumber, createdAt, updatedAt, qrcode_addr) VALUES (?, ?, ?, ?)',
    [tableNumber, createdAt, updatedAt, '']
  )
  const id = Number((insertResult as any).insertId)
  const resolvedTableNumber = tableNumber || String(id)
  const qrcode_addr = `/qrcodes/table-${id}.png`
  await execute('UPDATE `tables` SET tableNumber = ?, qrcode_addr = ? WHERE id = ?', [resolvedTableNumber, qrcode_addr, id])
  try {
    await saveQrCodePng(id)
  } catch (e) {
    console.error('saveQrCodePng failed', e)
  }
  await createAuditLog({
    openid,
    type: 'table',
    target: 'tables',
    targetId: id,
    content: `创建桌台 tableNumber=${resolvedTableNumber}`,
  })
  const table = normalizeTable({
    id,
    tableNumber: resolvedTableNumber,
    createdAt,
    updatedAt,
    qrcode_addr,
  })
  
  return {
    ...table,
    used:  '0分钟',
    currentOrderStatus:  '无订单',
    currentOrderStatusCode : 3,
  }
}

export async function updateTable(id: string | number, payload: TableUpdatePayload, openid: string = 'unknown') {
  const rows = await query('SELECT * FROM `tables` WHERE id = ? LIMIT 1', [id])
  const row = rows[0]
  if (!row) return null

  const tableNumber = payload.tableNumber ? String(payload.tableNumber) : String(row.tableNumber)
  const updatedAt = formatDateTimeForDb(new Date())
  const changes: string[] = []
  if (String(row.tableNumber) !== tableNumber) {
    changes.push(`tableNumber:${String(row.tableNumber)}->${tableNumber}`)
  }

  const currentOrder = await getLatestOrderForTable(id)
  const isEnded = currentOrder?.status === 1
  if (!currentOrder || currentOrder.status === 0 || currentOrder.status === 3 || isEnded) {
    if (payload.start) {
      await createOrder({
        tableId: Number(id),
        tableNumber,
        start: payload.start,
        end: payload.end ?? null,
        status: 2,
      }, openid)
      changes.push(`create order start=${payload.start} end=${payload.end ?? null} status=2`)
    }
  } else if (currentOrder.status === 2) {
    // 进行中订单：允许直接修改开始/结束时间
    // （结束订单时前端传 end=当前时间，读取时自动归入已结束状态）
    const updates: { start?: string | null; end?: string | null } = {}
    if (payload.start !== undefined) updates.start = payload.start
    if (payload.end !== undefined) updates.end = payload.end
    if (Object.keys(updates).length) {
      await updateOrderById(currentOrder.id, updates, openid)
      changes.push(`update order id=${currentOrder.id} start=${payload.start ?? '-'} end=${payload.end ?? '-'}`)
    }
  }

  if (changes.length) {
    await createAuditLog({
      openid,
      type: 'table',
      target: 'tables',
      targetId: Number(id),
      content: `修改桌台 ${changes.join('; ')}`,
    })
  }

  await execute('UPDATE `tables` SET tableNumber = ?, updatedAt = ? WHERE id = ?', [tableNumber, updatedAt, id])
  return await getTableById(id)
}
