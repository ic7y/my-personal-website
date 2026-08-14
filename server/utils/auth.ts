import { getHeader } from 'h3'
import { query, execute } from './db'

export type AdminAccount = { openid: string; nickname: string }

// 数据库管理员账号缓存（30s）
let adminCache: AdminAccount[] | null = null
let adminCacheAt = 0
const ADMIN_CACHE_TTL = 30000

function invalidateAdminCache() {
  adminCache = null
}

async function getDbAdminAccounts(): Promise<AdminAccount[]> {
  try {
    const rows = await query('SELECT openid, nickname FROM admins')
    return rows.map((r: any) => ({
      openid: String(r.openid),
      nickname: String(r.nickname || '')
    }))
  } catch (e) {
    console.error('[auth] getDbAdminAccounts error', e)
    return []
  }
}

async function getCachedDbAdmins(): Promise<AdminAccount[]> {
  if (adminCache && Date.now() - adminCacheAt < ADMIN_CACHE_TTL) {
    return adminCache
  }
  const dbAdmins = await getDbAdminAccounts()
  adminCache = dbAdmins
  adminCacheAt = Date.now()
  return dbAdmins
}

export async function isAdminOpenId(openid?: string): Promise<boolean> {
  const normalized = String(openid || '').trim()
  if (!normalized) return false
  // 开发/测试：以 admin 开头的 openid 视为管理员（openid 由微信签发，不可伪造）
  if (normalized.toLowerCase().startsWith('admin')) return true
  const dbAdmins = await getCachedDbAdmins()
  return dbAdmins.some((a) => a.openid === normalized)
}

export async function isAdmin(event: any): Promise<boolean> {
  return isAdminOpenId(getHeader(event, 'x-openid'))
}

export async function requireAdmin(event: any): Promise<boolean> {
  if (!(await isAdmin(event))) {
    setResponseStatus(event, 401)
    return false
  }
  return true
}

export async function getCurrentUserRole(event: any): Promise<string> {
  return (await isAdminOpenId(getHeader(event, 'x-openid'))) ? 'admin' : 'user'
}

// 返回数据库中的管理员账号（openid + nickname）
export async function getAdminAccounts(): Promise<AdminAccount[]> {
  return getDbAdminAccounts()
}

export async function addAdminOpenId(openid: string, nickname: string = ''): Promise<void> {
  const normalized = String(openid || '').trim()
  if (!normalized) return
  await execute(
    'INSERT INTO admins (openid, nickname, createdAt) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE nickname = VALUES(nickname)',
    [normalized, String(nickname || '')]
  )
  invalidateAdminCache()
}

export async function removeAdminOpenId(openid: string): Promise<void> {
  const normalized = String(openid || '').trim()
  if (!normalized) return
  await execute('DELETE FROM admins WHERE openid = ?', [normalized])
  invalidateAdminCache()
}
