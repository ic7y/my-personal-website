import { addAdminOpenId } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as { openid?: string; nickname?: string }
  const openid = String(body?.openid || '').trim()
  if (!openid) {
    setResponseStatus(event, 400)
    return { ok: false, message: 'openid is required' }
  }
  const nickname = String(body?.nickname || '').trim()
  await addAdminOpenId(openid, nickname)
  console.log('[api] POST /api/admin/openids added', { openid, nickname })
  return { ok: true, data: { openid, nickname } }
})
