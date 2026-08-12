import { createTable } from './utils/tables'

async function main() {
  try {
    const table = await createTable({ tableNumber: 'TEST-A1' })
    console.log('created', table)
  } catch (e) {
    console.error('createTable error', e)
    process.exit(1)
  }
}

main()
