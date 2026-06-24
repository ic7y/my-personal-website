import { getAllTables } from '../utils/tables'
import { requireAdmin } from '../utils/auth'

export default defineEventHandler(async (event) => {
  console.log('[api] GET /api/tables', event.node?.req?.method || event.req?.method, event.node?.req?.url || event.req?.url)
  if (!requireAdmin(event)) return { ok: false, message: 'unauthorized' }
  const tables = await getAllTables()
  return { ok: true, data: tables }
})
