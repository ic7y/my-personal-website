import fs from 'fs/promises'
import path from 'path'
import QRCode from 'qrcode'

export function createMiniProgramPath(tableId: number | string) {
  return `pages/table/index?tableId=${tableId}`
}

export async function generateQrCodeBuffer(payload: string) {
  return QRCode.toBuffer(payload, { type: 'png', width: 300 })
}

export async function saveQrCodePng(tableId: number | string) {
  const payload = createMiniProgramPath(tableId)
  const buffer = await generateQrCodeBuffer(payload)
  const fileName = `table-${tableId}.png`
  const outPath = path.resolve(process.cwd(), 'public', 'qrcodes', fileName)
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, buffer)
  return { fileName, url: `/qrcodes/${fileName}`, outPath }
}
