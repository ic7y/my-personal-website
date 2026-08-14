import { getTableById } from '../../utils/tables'
import { getCurrentUserRole } from '../../utils/auth'
import { getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  console.log('[api] GET /api/tables/:id', event.node?.req?.method || event.req?.method, event.context.params)
  const { id } = event.context.params as { id: string }
  const table = await getTableById(id)
  if (!table) {
    setResponseStatus(event, 404)
    return { ok: false, message: 'table not found' }
  }
  const role = getCurrentUserRole(event)
  const openid = getHeader(event, 'x-openid') || ''
  const unionid = getHeader(event, 'x-unionid') || ''
  return { ok: true, data: table, role, openid, unionid }
})
