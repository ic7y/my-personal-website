import { removeAdminOpenId } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const { openid } = event.context.params as { openid: string }
  const decoded = decodeURIComponent(openid || '')
  await removeAdminOpenId(decoded)
  console.log('[api] DELETE /api/admin/openids/:openid removed', { openid: decoded })
  return { ok: true, data: { openid: decoded } }
})
