import { createTable } from '../utils/tables'
import { getHeader, requireAdmin } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const method = event.node?.req?.method || event.req?.method
  const url = event.node?.req?.url || event.req?.url
  console.log('[api] POST /api/tables request', { method, url })
  // if (!requireAdmin(event)) return { ok: false, message: 'unauthorized' }
  const body = await readBody(event)
  console.log('[api] POST /api/tables body', body)
  if (!body || !body.tableNumber) {
    const result = { ok: false, message: 'tableNumber is required' }
    setResponseStatus(event, 400)
    console.log('[api] POST /api/tables response', result)
    return result
  }
  const openid = getHeader(event, 'x-openid') || 'unknown'
  const table = await createTable({
    tableNumber: body.tableNumber,
    start: body.start ?? null,
    end: body.end ?? null,
  }, openid)
  const result = { ok: true, data: table }
  console.log('[api] POST /api/tables response', result)
  return result
})
