import { updateTable } from '../../utils/tables'
import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  console.log('[api] PUT /api/tables/:id', event.node?.req?.method || event.req?.method, event.context.params)
  if (!requireAdmin(event)) return { ok: false, message: 'unauthorized' }
  const { id } = event.context.params as { id: string }
  const body = await readBody(event)
  const updated = await updateTable(id, {
    tableNumber: body.tableNumber,
    start: body.start ?? null,
    end: body.end ?? null,
  })
  if (!updated) {
    setResponseStatus(event, 404)
    return { ok: false, message: 'table not found' }
  }
  return { ok: true, data: updated }
})
