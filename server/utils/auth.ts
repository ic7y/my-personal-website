const ADMIN_OPENIDS = (process.env.ADMIN_OPENIDS || '').split(',').map((s) => s.trim()).filter(Boolean)
const ADMIN_UNIONIDS = (process.env.ADMIN_UNIONIDS || 'admin001,admin002').split(',').map((s) => s.trim()).filter(Boolean)

export function getHeader(event: any, name: string): string | undefined {
  return (event.node?.req?.headers[name] || event.req?.headers[name]) as string | undefined
}

export function isAdmin(event: any) {
  const token = getHeader(event, 'x-admin-token')
  const openid = getHeader(event, 'x-openid')
  const unionid = getHeader(event, 'x-unionid')
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'changeme'

  if (token && token === ADMIN_TOKEN) return true
  if (openid && ADMIN_OPENIDS.includes(openid)) return true
  if (unionid && ADMIN_UNIONIDS.includes(unionid)) return true
  return false
}

export function requireAdmin(event: any) {
  if (!isAdmin(event)) {
    setResponseStatus(event, 401)
    return false
  }
  return true
}

export function getCurrentUserRole(event: any) {
  const token = getHeader(event, 'x-admin-token')
  const openid = getHeader(event, 'x-openid')
  const unionid = getHeader(event, 'x-unionid')
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'changeme'

  if (token && token === ADMIN_TOKEN) return 'admin'
  if (openid && ADMIN_OPENIDS.includes(openid)) return 'admin'
  if (unionid && ADMIN_UNIONIDS.includes(unionid)) return 'admin'
  return 'user'
}
