import { getTableById } from '../../../utils/tables'
import QRCode from 'qrcode'

export default defineEventHandler(async (event) => {
  console.log('[api] GET /api/tables/:id/qrcode', event.node?.req?.method || event.req?.method, event.context.params)
  const { id } = event.context.params as { id: string }
  const table = await getTableById(id)
  if (!table) {
    setResponseStatus(event, 404)
    return { ok: false, message: 'table not found' }
  }
  const payload = `pages/index/index?tableId=${encodeURIComponent(table.tableNumber || String(table.id))}&role=user`
  // Generate PNG data URL
  const pngDataUrl = await QRCode.toDataURL(payload, { type: 'image/png' })
  return {
    ok: true,
    data: {
      path: payload,
      tableNumber: table.tableNumber,
      infoUrl: `/api/tables/${table.id}`,
      pngDataUrl,
    },
  }
})
