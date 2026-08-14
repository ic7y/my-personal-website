// 微信小程序码生成工具
// 依赖环境变量：WX_APPID / WX_SECRET（小程序需已发布）
// 扫码后打开小程序 pages/index/index，桌台参数通过 scene 传递（形如 t=<tableId>）

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  const appid = process.env.WX_APPID || ''
  const secret = process.env.WX_SECRET || ''
  if (!appid || !secret) {
    console.warn('[wxacode] WX_APPID / WX_SECRET 未配置，无法生成小程序码')
    return ''
  }
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }
  try {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(appid)}&secret=${encodeURIComponent(secret)}`
    const res = await $fetch<{ access_token?: string; expires_in?: number; errcode?: number; errmsg?: string }>(url)
    if (!res?.access_token) {
      console.error('[wxacode] getAccessToken failed', res?.errcode, res?.errmsg)
      return ''
    }
    const expiresIn = Number(res.expires_in || 7200)
    // 提前 60s 过期，避免边界失效
    cachedToken = { token: res.access_token, expiresAt: Date.now() + (expiresIn - 60) * 1000 }
    return res.access_token
  } catch (e: any) {
    console.error('[wxacode] getAccessToken error', e?.message)
    return ''
  }
}

/**
 * 生成该桌台的小程序码（PNG Buffer），失败返回 null
 */
export async function generateMiniProgramCode(tableId: number | string): Promise<Buffer | null> {
  const token = await getAccessToken()
  if (!token) return null
  try {
    const body = {
      scene: `t=${tableId}`,
      page: 'pages/index/index',
      check_path: false,
      env_version: 'release',
      width: 300,
      auto_color: false,
    }
    const res = await $fetch<ArrayBuffer>(`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${token}`, {
      method: 'POST',
      body,
      responseType: 'arrayBuffer',
    })
    const buffer = Buffer.from(res)
    // 失败时微信返回 JSON（以 { 开头）
    if (buffer.length > 0 && buffer[0] === 0x7b) {
      console.error('[wxacode] getwxacodeunlimit failed', buffer.toString('utf8'))
      return null
    }
    return buffer
  } catch (e: any) {
    console.error('[wxacode] generateMiniProgramCode error', e?.message)
    return null
  }
}
