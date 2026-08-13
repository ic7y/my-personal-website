export function getHeader(event: any, name: string): string | undefined {
  return (event.node?.req?.headers[name] || event.req?.headers[name]) as string | undefined
}

function isAdminOpenId(openid?: string): boolean {
  const normalized = String(openid || '').trim()
  console.log('[auth] isAdminOpenId', { openid, normalized })
  return normalized.toLowerCase().startsWith('admin')
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
