const headers = {
  'Content-Type': 'application/json',
  'x-admin-token': 'changeme'
}

async function run() {
  const create = await fetch('http://localhost:3000/api/tables', {
    method: 'POST',
    headers,
    body: JSON.stringify({ tableNumber: 'T1', start: '2026-06-20T10:00:00.000Z' })
  })
  console.log('CREATE', create.status)
  console.log(await create.text())

  const list = await fetch('http://localhost:3000/api/tables', { method: 'GET', headers })
  console.log('LIST', list.status)
  console.log(await list.text())

  const single = await fetch('http://localhost:3000/api/tables/1')
  console.log('GET1', single.status)
  console.log(await single.text())

  const qrcode = await fetch('http://localhost:3000/api/tables/1/qrcode')
  console.log('QRCODE', qrcode.status)
  console.log(await qrcode.text())
}

run().catch(err => {
  console.error('ERROR', err)
  process.exit(1)
})
