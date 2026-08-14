import { getAllTables } from '../utils/tables'
import { getCurrentUserRole } from '../utils/auth'
import { getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const method = event.node?.req?.method || event.req?.method
  const headers = {
    'x-openid': event.node?.req?.headers['x-openid'] || event.req?.headers['x-openid'],
    'x-unionid': event.node?.req?.headers['x-unionid'] || event.req?.headers['x-unionid'],
  }
  console.log('[api] GET /api/tables request', { method, headers })
  // Allow all users to view the tables list
  const tables = await getAllTables()
  const role = await getCurrentUserRole(event)
  const openid = getHeader(event, 'x-openid') || ''
  const unionid = getHeader(event, 'x-unionid') || ''
  const result = { ok: true, data: tables, role, openid, unionid }
  console.log('[api] GET /api/tables response', result)
  return result
})
