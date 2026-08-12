export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { code?: string }
  const code = body?.code || ''
  console.log('[api] POST /api/wechat/login', { code: code ? 'received' : 'missing' })

  if (!code) {
    setResponseStatus(event, 400)
    return { ok: false, message: 'code is required' }
  }

  const appid = process.env.WX_APPID || ''
  const secret = process.env.WX_SECRET || ''

  if (!appid || !secret) {
    const devOpenId = process.env.WX_DEV_OPENID || 'admin001'
    const devUnionId = process.env.WX_DEV_UNIONID || devOpenId
    console.log('[api] POST /api/wechat/login dev mode, returning stable openid', { devOpenId, devUnionId })
    return {
      ok: true,
      data: {
        openid: devOpenId,
        unionid: devUnionId,
        nickname: 'wechat-user',
      },
    }
  }

  try {
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(appid)}&secret=${encodeURIComponent(secret)}&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`
    const res = await $fetch<{ openid?: string; unionid?: string; errcode?: number; errmsg?: string }>(url)

    if (res?.errcode) {
      return { ok: false, message: res.errmsg || 'wechat login failed' }
    }

    return {
      ok: true,
      data: {
        openid: res.openid || '',
        unionid: res.unionid || res.openid || '',
      },
    }
  } catch (e: any) {
    return { ok: false, message: e?.message || 'wechat login failed' }
  }
})
