import fs from 'fs/promises'
import path from 'path'

type Table = {
  id: number
  tableNumber: string
  start?: string | null
  end?: string | null
  createdAt?: string
}

const DATA_FILE = path.resolve(process.cwd(), 'server/data/tables.json')

async function readData(): Promise<Table[]> {
  try {
    const txt = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(txt || '[]')
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
      await fs.writeFile(DATA_FILE, '[]', 'utf-8')
      return []
    }
    throw e
  }
}

async function writeData(data: Table[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function computeUsed(start?: string | null) {
  if (!start) return { minutes: 0, formatted: '0小时0分钟' }
  const s = new Date(start).getTime()
  if (Number.isNaN(s)) return { minutes: 0, formatted: '0小时0分钟' }
  const now = Date.now()
  const diff = Math.max(0, now - s)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const rem = minutes % 60
  return { minutes, formatted: `${hours}小时${rem}分钟`, hours, minutesOnly: minutes }
}

export async function getAllTables() {
  const data = await readData()
  return data.map((t) => ({ ...t, used: computeUsed(t.start) }))
}

export async function getTableById(id: string | number) {
  const data = await readData()
  const t = data.find((x) => String(x.id) === String(id))
  if (!t) return null
  return { ...t, used: computeUsed(t.start) }
}

export async function createTable(payload: Partial<Table>) {
  const data = await readData()
  const id = data.length ? Math.max(...data.map((d) => d.id)) + 1 : 1
  const table: Table = {
    id,
    tableNumber: payload.tableNumber || String(id),
    start: payload.start ?? null,
    end: payload.end ?? null,
    createdAt: new Date().toISOString(),
  }
  data.push(table)
  await writeData(data)
  return table
}

export async function updateTable(id: string | number, payload: Partial<Table>) {
  const data = await readData()
  const idx = data.findIndex((x) => String(x.id) === String(id))
  if (idx === -1) return null
  const updated = { ...data[idx], ...payload }
  data[idx] = updated
  await writeData(data)
  return updated
}
