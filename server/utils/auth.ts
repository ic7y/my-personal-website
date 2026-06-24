export function isAdmin(event: any) {
  // simple header-based token check for admin
  const token = (event.node?.req?.headers['x-admin-token'] || event.req?.headers['x-admin-token']) as string | undefined
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'changeme'
  return token && token === ADMIN_TOKEN
}

export function requireAdmin(event: any) {
  if (!isAdmin(event)) {
    setResponseStatus(event, 401)
    return false
  }
  return true
}
