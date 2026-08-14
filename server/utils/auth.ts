import { getHeader } from 'h3'

const adminOpenIds=['wx_0f1iPh200VnmSW1IbC2009PrIl0iPh2I', 'admin002']

function isAdminOpenId(openid?: string): boolean {
  const normalized = String(openid || '').trim()
  console.log('[auth] isAdminOpenId', { openid, normalized })
  return adminOpenIds.includes(normalized) || normalized.toLowerCase().startsWith('admin')
}

export function isAdmin(event: any) {
  const openid = getHeader(event, 'x-openid')
  return isAdminOpenId(openid)
}

export function requireAdmin(event: any) {
  if (!isAdmin(event)) {
    setResponseStatus(event, 401)
    return false
  }
  return true
}

export function getCurrentUserRole(event: any) {
  const openid = getHeader(event, 'x-openid')
  return isAdminOpenId(openid) ? 'admin' : 'user'
}
