import { getTableById } from '../../../utils/tables'
import { generateMiniProgramCode } from '../../../utils/wxacode'
import QRCode from 'qrcode'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string }
  const table = await getTableById(id)
  if (!table) {
    setResponseStatus(event, 404)
    return { ok: false, message: 'table not found' }
  }
  // 优先生成小程序码；未配置凭证或失败时回退普通二维码
  const wxCode = await generateMiniProgramCode(table.id)
  if (wxCode) {
    setResponseHeader(event, 'Content-Type', 'image/png')
    setResponseHeader(event, 'Cache-Control', 'no-cache')
    return wxCode
  }
  const payload = `pages/index/index?tableId=${encodeURIComponent(table.tableNumber || String(table.id))}&role=user`
  const buffer = await QRCode.toBuffer(payload, { type: 'png', width: 300 })
  setResponseHeader(event, 'Content-Type', 'image/png')
  return buffer
})