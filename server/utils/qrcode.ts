import fs from 'fs/promises'
import path from 'path'
import QRCode from 'qrcode'
import { generateMiniProgramCode } from './wxacode'

export function createMiniProgramPath(tableId: number | string) {
  return `pages/index/index?tableId=${tableId}&role=user`
}

export async function generateQrCodeBuffer(payload: string) {
  return QRCode.toBuffer(payload, { type: 'png', width: 300 })
}

export async function saveQrCodePng(tableId: number | string) {
  // 优先生成小程序码，未配置凭证或失败时回退普通二维码
  let buffer = await generateMiniProgramCode(tableId)
  if (!buffer) {
    const payload = createMiniProgramPath(tableId)
    buffer = await generateQrCodeBuffer(payload)
  }
  const fileName = `table-${tableId}.png`
  const outPath = path.resolve(process.cwd(), 'public', 'qrcodes', fileName)
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, buffer)
  return { fileName, url: `/qrcodes/${fileName}`, outPath }
}
