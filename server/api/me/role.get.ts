import { getCurrentUserRole, getHeader } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const role = getCurrentUserRole(event)
  return {
    ok: true,
    role,
    openid: getHeader(event, 'x-openid') || '',
    unionid: getHeader(event, 'x-unionid') || ''
  }
})
