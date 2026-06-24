import { getTableById } from '../../../utils/tables'
import { requireAdmin } from '../../../utils/auth'
import { saveQrCodePng } from '../../../utils/qrcode'

export default defineEventHandler(async (event) => {
  if (!requireAdmin(event)) return { ok: false, message: 'unauthorized' }
  const { id } = event.context.params as { id: string }
  const table = await getTableById(id)
  if (!table) {
    setResponseStatus(event, 404)
    return { ok: false, message: 'table not found' }
  }
  const result = await saveQrCodePng(table.id)
  return { ok: true, data: result }
})
