import { getTableById } from '../../utils/tables'

export default defineEventHandler(async (event) => {
  console.log('[api] GET /api/tables/:id', event.node?.req?.method || event.req?.method, event.context.params)
  const { id } = event.context.params as { id: string }
  const table = await getTableById(id)
  if (!table) {
    setResponseStatus(event, 404)
    return { ok: false, message: 'table not found' }
  }
  return { ok: true, data: table }
})
