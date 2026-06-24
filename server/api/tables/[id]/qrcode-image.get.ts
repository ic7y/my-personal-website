import { getTableById } from '../../../utils/tables'
import QRCode from 'qrcode'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string }
  const table = await getTableById(id)
  if (!table) {
    setResponseStatus(event, 404)
    return { ok: false, message: 'table not found' }
  }
  const miniPath = `pages/table/index?tableId=${table.id}`
  const buffer = await QRCode.toBuffer(miniPath, { type: 'png', width: 300 })
  setResponseHeader(event, 'Content-Type', 'image/png')
  return buffer
})