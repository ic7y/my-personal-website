import { getCurrentUserRole } from '../../utils/auth'
import { getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const role = getCurrentUserRole(event)
  return {
    ok: true,
    role,
    openid: getHeader(event, 'x-openid') || '',
    unionid: getHeader(event, 'x-unionid') || ''
  }
})
