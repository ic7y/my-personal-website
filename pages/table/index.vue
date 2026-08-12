<template>
  <div class="min-h-screen bg-slate-50 p-4 text-slate-800">
    <div class="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <p class="text-sm text-slate-500">桌号计时小程序</p>
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-semibold">桌号 {{ table?.tableNumber || tableId }}</h1>
            <div class="text-sm text-slate-500">已用时：<span class="font-medium text-amber-700">{{ table?.used?.formatted || '0分钟' }}</span></div>
            <button class="ml-2 rounded-md bg-slate-100 px-3 py-1 text-sm hover:bg-slate-200" @click="openQr">
              二维码
            </button>
          </div>
        </div>
        <span class="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
          {{ role === 'admin' ? '管理员' : '普通用户' }}
        </span>
      </div>

      <div v-if="loading" class="rounded-xl bg-slate-100 p-4 text-slate-600">正在加载桌号信息…</div>
      <div v-else-if="error" class="rounded-xl bg-rose-100 p-4 text-rose-700">{{ error }}</div>
      <div v-else class="space-y-5">
        <div class="rounded-xl border border-slate-200 p-4">
          <div class="flex items-center justify-between">
            <div class="text-sm text-slate-500">当前订单开始</div>
            <div class="text-sm text-slate-500">当前订单结束</div>
          </div>
          <div class="mt-2 flex items-center justify-between">
            <div class="text-lg font-semibold">{{ formatDate(table?.currentOrder?.start) }}</div>
            <div class="flex items-center gap-3">
              <div class="text-lg font-semibold">{{ formatDate(table?.currentOrder?.end) }}</div>
              <button v-if="role === 'admin'" class="rounded-md bg-slate-800 px-3 py-1 text-sm text-white" @click="setEndNow">时间修改</button>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-amber-600">已使用时间</p>
              <p class="mt-1 text-3xl font-semibold text-amber-700">{{ table?.used?.formatted || '0小时0分钟' }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-amber-600">当前订单状态：<span class="font-medium">{{ table?.currentOrderStatus || '无订单' }}</span></p>
              <div class="mt-2">
                <button v-if="role === 'admin'" class="rounded-md bg-slate-800 px-3 py-1 text-sm text-white" @click="modifyOrderStatus">订单状态修改</button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="role === 'admin'" class="rounded-xl border border-slate-200 p-4">
          <h2 class="text-lg font-semibold">管理员设置</h2>
          <div class="mt-3 grid gap-3 md:grid-cols-2">
            <label class="text-sm">
              <span class="mb-1 block text-slate-600">开始时间</span>
              <input v-model="startInput" type="datetime-local" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label class="text-sm">
              <span class="mb-1 block text-slate-600">结束时间</span>
              <input v-model="endInput" type="datetime-local" class="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
          </div>
          <button class="mt-4 rounded-lg bg-slate-800 px-4 py-2 font-medium text-white" @click="saveSchedule">
            保存设置
          </button>
          <p v-if="saveMessage" class="mt-2 text-sm text-emerald-600">{{ saveMessage }}</p>
        </div>


        <div v-if="table?.orders?.length" class="rounded-xl border border-slate-200 p-4">
          <h2 class="text-lg font-semibold">订单记录</h2>
          <ul class="mt-3 space-y-2">
            <li v-for="order in table.orders" :key="order.id" class="rounded-lg bg-slate-50 p-3 text-sm">
              <div class="flex items-center justify-between">
                <span>订单 #{{ order.id }}</span>
                <span class="text-slate-500">状态：{{ order.statusLabel || order.status }}</span>
              </div>
              <div class="mt-1 text-slate-600">开始：{{ formatDate(order.start) }}｜结束：{{ formatDate(order.end) }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const tableId = computed(() => String(route.query.tableId || route.params.id || ''))
const role = ref<'admin' | 'user'>('user')
const openid = ref('')
const loading = ref(true)
const error = ref('')
const saveMessage = ref('')
const table = ref<any>(null)
const startInput = ref('')
const endInput = ref('')

function formatDate(value?: string | null) {
  if (!value) return '未设置'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未设置'
  return date.toLocaleString('zh-CN', { hour12: false })
}

function toLocalInput(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

async function loadTable() {
  if (!tableId.value) {
    error.value = '缺少桌号参数'
    loading.value = false
    return
  }
  loading.value = true
  error.value = ''
  try {
    const headers: Record<string, string> = {}
    if (openid.value) headers['x-openid'] = openid.value
    const res = await $fetch(`/api/tables/${tableId.value}`, { headers })
    if (!res.ok) throw new Error(res.message || '加载失败')
    table.value = res.data
    startInput.value = toLocalInput(res.data?.currentOrder?.start)
    endInput.value = toLocalInput(res.data?.currentOrder?.end)
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

async function saveSchedule() {
  try {
    const payload: Record<string, string | null> = {}
    payload.start = startInput.value ? new Date(startInput.value).toISOString() : null
    payload.end = endInput.value ? new Date(endInput.value).toISOString() : null
    const headers: Record<string, string> = {}
    if (openid.value) headers['x-openid'] = openid.value
    const res = await $fetch(`/api/tables/${tableId.value}`, {
      method: 'PUT',
      body: payload,
      headers,
    })
    if (!res.ok) throw new Error(res.message || '保存失败')
    table.value = res.data
    saveMessage.value = '设置已保存'
  } catch (e: any) {
    saveMessage.value = e?.message || '保存失败'
  }
}

function openQr() {
  const url = table.value?.qrcode_addr || table.value?.qrcode || ''
  if (!url) {
    alert('未找到二维码')
    return
  }
  // open in new tab
  window.open(url, '_blank')
}

async function setEndNow() {
  if (role.value !== 'admin') return
  const nowIso = new Date().toISOString()
  endInput.value = toLocalInput(nowIso)
  await saveSchedule()
}

async function modifyOrderStatus() {
  if (role.value !== 'admin') return
  const ok = confirm('将当前订单结束（设置结束时间为现在）？')
  if (!ok) return
  await setEndNow()
}

onMounted(() => {
  // determine openid from query or localStorage
  const qOpenid = (route.query.userId as string | undefined) || (route.query.openid as string | undefined) || ''
  const cached = window.localStorage.getItem('currentOpenId') || ''
  openid.value = qOpenid || cached || ''

  // ask server for role using x-openid header when available
  ;(async () => {
    try {
      const headers: Record<string, string> = {}
      if (openid.value) headers['x-openid'] = openid.value
      const r = await $fetch('/api/me/role', { headers })
      role.value = r?.role === 'admin' ? 'admin' : 'user'
    } catch (e) {
      role.value = 'user'
    } finally {
      loadTable()
    }
  })()
})

watch(tableId, () => {
  loadTable()
})
</script>
