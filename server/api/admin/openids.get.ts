import { getAdminAccounts } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const accounts = await getAdminAccounts()
  return { ok: true, data: accounts }
})
