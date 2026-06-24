import { createTable } from '../utils/tables'
import { requireAdmin } from '../utils/auth'

export default defineEventHandler(async (event) => {
  console.log('[api] POST /api/tables', event.node?.req?.method || event.req?.method, event.node?.req?.url || event.req?.url)
  if (!requireAdmin(event)) return { ok: false, message: 'unauthorized' }
  const body = await readBody(event)
  if (!body || !body.tableNumber) {
    setResponseStatus(event, 400)
    return { ok: false, message: 'tableNumber is required' }
  }
  const table = await createTable({
    tableNumber: body.tableNumber,
    start: body.start ?? null,
    end: body.end ?? null,
  })
  return { ok: true, data: table }
})
