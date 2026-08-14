import { updateTable } from '../../utils/tables'
import { requireAdmin } from '../../utils/auth'
import { getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const method = event.node?.req?.method || event.req?.method
  const params = event.context.params as { id: string }
  console.log('[api] PUT /api/tables/:id request', { method, params })
  // if (!requireAdmin(event)) return { ok: false, message: 'unauthorized' }
  const { id } = params
  const body = await readBody(event)
  console.log('[api] PUT /api/tables/:id body', body)
  const openid = getHeader(event, 'x-openid') || 'unknown'
  const updated = await updateTable(id, {
    tableNumber: body.tableNumber,
    start: body.start ?? null,
    end: body.end ?? null,
  }, openid)
  if (!updated) {
    const result = { ok: false, message: 'table not found' }
    setResponseStatus(event, 404)
    console.log('[api] PUT /api/tables/:id response', result)
    return result
  }
  const result = { ok: true, data: updated }
  console.log('[api] PUT /api/tables/:id response', result)
  return result
})
