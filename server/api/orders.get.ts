import { getAllOrders } from '../utils/orders'
import { getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const method = event.node?.req?.method || event.req?.method
  const query =  getQuery(event)  || {}
  const tableNumber = String(query.tableNumber || '').trim()
  const date = String(query.date || '').trim()

  console.log('[api] GET /api/orders request', { method, tableNumber, date })
  const orders = await getAllOrders()

  const filtered = orders
    .filter((order) => {
      if (tableNumber && String(order.tableNumber).trim() !== tableNumber) {
        return false
      }
      if (date) {
        const createdAt = order.createdAt || ''
        return createdAt.startsWith(date)
      }
      return true
    })
    .sort((a, b) => {
      // 按开始时间降序，开始时间为空的排最后
      const ta = a.start ? new Date(a.start).getTime() : -Infinity
      const tb = b.start ? new Date(b.start).getTime() : -Infinity
      return tb - ta
    })

  const result = { ok: true, data: filtered }
  console.log('[api] GET /api/orders response', { count: filtered.length })
  return result
})
