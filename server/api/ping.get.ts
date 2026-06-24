export default defineEventHandler(() => {
  console.log('[api] PING /api/ping')
  return { ok: true, now: new Date().toISOString() }
})
