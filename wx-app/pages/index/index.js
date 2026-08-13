const app = getApp()

Page({
  autoRefreshTimer: null,
  pageLoadLock: false, // 请求并发锁，防止重复调用

  data: {
    tableId: '',
    table: null,
    tables: [],
    loading: false,
    role: 'user',
    userId: '',
    openId: '',
    unionId: '',
    loginResult: '',
    selectedTableId: '',
    error: '',
    isFirstLoad: true,
    silentLoading: false,
    showQrCode: false,
    qrCodeImageUrl: '',
    // add modal state
    addModalVisible: false,
    newTableNumber: '',
    addMessage: '',
    // edit modal state
    editModalVisible: false,
    editTableId: null,
    editStart: null,
    editEnd: null
  },


  async onLoad(options) {
    console.log('index onLoad start', options)
    const tableId = options.tableId || ''
    const cachedOpenId = options.userId || app.globalData.currentOpenId || wx.getStorageSync('currentOpenId') || ''
    const cachedUnionId = options.unionId || app.globalData.currentUnionId || wx.getStorageSync('currentUnionId') || ''

    const loginState = cachedOpenId || cachedUnionId
      ? { openid: cachedOpenId, unionid: cachedUnionId, isLoggedIn: true }
      : await app.ensureLoginOnEntry()

    const openId = loginState.openid || cachedOpenId
    const unionId = loginState.unionid || cachedUnionId

    console.log('index onLoad identity', { openId, unionId, isLoggedIn: loginState.isLoggedIn })
    this.setData({ tableId, userId: openId, openId, unionId, selectedTableId: '' })
    app.globalData.tableId = tableId
    app.globalData.currentOpenId = openId
    app.globalData.currentUnionId = unionId
    app.globalData.currentUserId = openId

    if (!openId && !unionId) {
      this.setData({ role: 'guest' })
      return
    }

    // 仅onLoad做初始化请求
    await this.loadTables()

    const role = await app.verifyUserRole(openId, unionId)
    this.setData({ role })
    app.globalData.role = role

    if (role === 'admin' && tableId) {
      wx.reLaunch({ url: `/pages/admin/admin?tableId=${tableId}&userId=${encodeURIComponent(openId)}&unionId=${encodeURIComponent(unionId)}` })
      return
    }

    console.log('onLoad 最终 role:', this.data.role)
    console.log('onLoad tables:', this.data.tables)
    console.log('onLoad table:', this.data.tableId)
  },

  onShow() {
    // 页面第一次打开，完全禁止onShow拉取数据；只有切页返回才刷新
    if (this.data.isFirstLoad) {
      this.setData({ isFirstLoad: false })
      return
    }
    // 非首次，正常刷新
    this.loadTables()
  },

  onHide() {
    this.stopAutoRefresh()
  },

  onUnload() {
    this.stopAutoRefresh()
  },

  startAutoRefresh() {
    this.stopAutoRefresh()
    if (!this.data.tableId) return
    this.autoRefreshTimer = setInterval(() => {
      this.loadTable()
    }, 15000)
  },

  stopAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer)
      this.autoRefreshTimer = null
    }
  },

  async loadTables() {
    // 并发锁：如果正在请求，直接拒绝重复调用
    if (this.pageLoadLock) {
      console.log('loadTables 正在请求中，拒绝重复调用')
      return
    }
    this.pageLoadLock = true

    console.log('loadTables called', { currentOpenId: app.globalData.currentOpenId, currentUnionId: app.globalData.currentUnionId, role: app.globalData.role })
    this.setData({ loading: true, error: '' })
    try {
      const headers = {
        'x-openid': app.globalData.currentOpenId,
        'x-unionid': app.globalData.currentUnionId
      }
      const currentOpenId = app.globalData.currentOpenId || this.data.openId
      const isDevAdmin = currentOpenId === 'admin001' || currentOpenId === 'admin002'
      const isLocalDev = app.globalData.baseUrl.includes('127.0.0.1') || app.globalData.baseUrl.includes('localhost')
      if (isDevAdmin || isLocalDev) {
        headers['x-admin-token'] = app.globalData.adminToken
      }
      console.log('loadTables request headers', headers)
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/tables`,
          method: 'GET',
          header: headers,
          success: resolve,
          fail: reject
        })
      })
      console.log('loadTables response', res)
      if (res.data && res.data.ok) {
          const rawList = res.data.data || []
          // 清洗纯净数组，生成全新数组引用
          const tables = JSON.parse(JSON.stringify(
            rawList.map(item => ({
              id: item.id,
              tableNumber: item.tableNumber,
              currentOrder: item.currentOrder || null,
              start: item.currentOrder?.start || null,
              end: item.currentOrder?.end || null,
              used: item.used || { formatted: '0分钟' },
              currentOrderStatus: item.currentOrderStatus || '无订单'
            }))
          ))
          console.log('loadTables set tables', tables)

          // 全部数据一次性平铺set，不要任何嵌套回调
          const currentOpenId = app.globalData.currentOpenId || this.data.openId
          const isAdminUser = app.isAdminUserId(currentOpenId) || app.isAdminUserId(app.globalData.currentUnionId)
          const isLocalDev = app.globalData.baseUrl.includes('127.0.0.1') || app.globalData.baseUrl.includes('localhost')
          const roleToSet = tables.length && (this.data.role === 'admin' || app.globalData.role === 'admin' || isAdminUser || isLocalDev) ? 'admin' : this.data.role

          // 处理table匹配
          let matchTable = null
          const tableIdToShow = this.data.tableId || this.data.selectedTableId || app.globalData.tableId || ''
          if (tableIdToShow) {
            const matched = tables.find(t => String(t.id) === String(tableIdToShow) || String(t.tableNumber) === String(tableIdToShow) || String(t.tableId || '') === String(tableIdToShow))
            if (matched) matchTable = matched
          }
          if (!matchTable && tables.length === 1) {
            matchTable = tables[0]
          }

          // ========= 重点：所有数据一次性批量set，无嵌套 =========
          this.setData({
            tables: tables,
            role: roleToSet,
            table: matchTable
          })

          // 全局role只改global，不用放setData
          if (roleToSet === 'admin') {
            app.globalData.role = 'admin'
          }
        }
    } catch (e) {
      console.error('loadTables error', e)
      this.setData({ error: '网络错误' })
    } finally {
      // 清空锁，清理无效代码
      this.pageLoadLock = false
      this.setData({ loading: false }, () => {
        console.log('setData回调，最终loading：', this.data.loading)
      })
    }
  },

async loadTables2() {
  if (this.pageLoadLock) {
    console.log('loadTables 正在请求中，拒绝重复调用')
    return
  }
  this.pageLoadLock = true

  console.log('loadTables called')
  this.setData({ loading: true, error: '' })
  try {
    // 彻底屏蔽网络请求，手写纯净数组，无任何接口
    const tables = [
      {
        id: 1,
        tableNumber: "A1",
        start: null,
        end: null
      }
    ]
    // 所有参数一次性赋值，无任何回调嵌套
    this.setData({
      tables: tables,
      role: "admin"
    })
    console.log('onLoad 最终 role:', this.data.role);
    console.log('onLoad tables:', this.data.tables);
    console.log('onLoad table:', this.data.tableId);
  } catch (e) {
    console.error('loadTables error', e)
    this.setData({ error: '网络错误' })
  } finally {
    this.pageLoadLock = false
    this.setData({ loading: false }, () => {
      console.log('setData回调，最终loading：', this.data.loading)
    })
  }
},


  async loadTable() {
    const { tableId } = this.data
    if (!tableId) {
      this.setData({ error: '缺少桌号参数' })
      return
    }
    this.setData({ silentLoading: true, error: '' })
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/tables/${tableId}`,
          method: 'GET',
          success: resolve,
          fail: reject
        })
      })
      if (res.data && res.data.ok) {
        this.setData({ table: res.data.data, silentLoading: false })
      } else {
        this.setData({ error: '加载失败', silentLoading: false })
      }
    } catch (e) {
      this.setData({ error: '网络错误', silentLoading: false })
    }
  },

  extractTableId(text) {
    const normalized = (text || '').trim()
    if (!normalized) return ''
    const queryMatch = normalized.match(/(?:^|[?&])tableId=([^&]+)/i)
    if (queryMatch && queryMatch[1]) return decodeURIComponent(queryMatch[1])
    const pageMatch = normalized.match(/\/pages\/(?:index|table)\/index\?tableId=([^&]+)/i)
    if (pageMatch && pageMatch[1]) return decodeURIComponent(pageMatch[1])
    const pathMatch = normalized.match(/pages\/([^?]+)(?:\?(.+))?/i)
    if (pathMatch && pathMatch[1]) {
      const params = pathMatch[2] || ''
      const paramMatch = params.match(/tableId=([^&]+)/i)
      if (paramMatch && paramMatch[1]) return decodeURIComponent(paramMatch[1])
    }
    if (/^[A-Za-z0-9_-]+$/.test(normalized)) return normalized
    return ''
  },

  async ensureUserIdentityThenScan() {
    const currentUserId = this.data.openId || app.globalData.currentOpenId || wx.getStorageSync('currentOpenId') || ''
    const currentUnionId = this.data.unionId || app.globalData.currentUnionId || wx.getStorageSync('currentUnionId') || ''
    if (currentUserId) {
      const role = await app.verifyUserRole(currentUserId, currentUnionId)
      this.setData({ userId: currentUserId, openId: currentUserId, unionId: currentUnionId, role })
      app.globalData.currentOpenId = currentUserId
      app.globalData.currentUnionId = currentUnionId
      app.globalData.role = role
      this.scanQrCode()
      return
    }
    wx.showToast({ title: '请先点击授权登录', icon: 'none' })
    this.showLoginGuide()
  },

  showLoginGuide() {
    wx.showModal({
      title: '微信登录',
      content: '请先授权登录后，再继续使用桌台查询。',
      confirmText: '立即授权',
      success: (res) => {
        if (res.confirm) {
          this.loginWithWechat()
        }
      }
    })
  },

  async loginWithWechat() {
    try {
      const result = await app.loginWechatUser()
      console.log('loginWithWechat result', result)
      const openId = result?.openid || app.globalData.currentOpenId || wx.getStorageSync('currentOpenId') || ''
      const unionId = result?.unionid || app.globalData.currentUnionId || wx.getStorageSync('currentUnionId') || ''
      if (!openId) {
        wx.showToast({ title: '登录失败：未获取 openid', icon: 'none' })
        this.setData({ loginResult: '登录失败：未获取 openid' })
        return false
      }
      const role = await app.verifyUserRole(openId, unionId)
      console.log('loginWithWechat role', { openId, unionId, role })
      this.setData({ userId: openId, openId, unionId, role, loginResult: `登录成功: ${openId}` })
      app.globalData.currentOpenId = openId
      app.globalData.currentUnionId = unionId
      app.globalData.currentUserId = openId
      app.globalData.role = role
      wx.setStorageSync('currentOpenId', openId)
      wx.setStorageSync('currentUnionId', unionId)
      // 登录后刷新数据，加锁判断
      if (role === 'admin' && !this.pageLoadLock) {
        await this.loadTables()
      }
      return true
    } catch (e) {
      console.error('loginWithWechat error', e)
      wx.showToast({ title: '获取用户信息失败', icon: 'none' })
      this.setData({ loginResult: `登录失败：${e?.message || '未知错误'}` })
      return false
    }
  },

  async authorizeLogin() {
    console.log('authorizeLogin start')
    const success = await this.loginWithWechat()
    const openId = app.globalData.currentOpenId || wx.getStorageSync('currentOpenId') || ''
    const unionId = app.globalData.currentUnionId || wx.getStorageSync('currentUnionId') || ''
    let role = app.globalData.role || this.data.role
    const message = success
      ? `登录成功: ${openId || 'openid 未获取'} / ${unionId || 'unionid 未获取'}`
      : '登录失败，请查看后台日志'
    console.log('authorizeLogin result', { success, openId, unionId, role })
    this.setData({ openId, unionId, role, loginResult: message })
    wx.showToast({ title: message, icon: success ? 'success' : 'none' })

    if (!success) return

    const roleRefresh = await app.verifyUserRole(openId, unionId)
    console.log('authorizeLogin roleRefresh', { roleRefresh })
    role = roleRefresh
    this.setData({ role })
    app.globalData.role = role
    // 登录刷新增加锁判断
    if (role === 'admin' && !this.pageLoadLock) {
      await this.loadTables()
    }
  },

  async scanQrCode() {
    if (!this.data.openId) {
      const loggedIn = await this.loginWithWechat()
      if (!loggedIn) return
    }

    wx.scanCode({
      onlyFromCamera: true,
      success: async (res) => {
        const tableId = this.extractTableId(res.result || '')
        if (tableId) {
          app.globalData.tableId = tableId
          const currentUserId = this.data.userId || app.globalData.currentOpenId || wx.getStorageSync('currentOpenId') || ''
          const currentUnionId = app.globalData.currentUnionId || wx.getStorageSync('currentUnionId') || ''
          const role = await app.verifyUserRole(currentUserId, currentUnionId)
          if (role === 'admin') {
            wx.reLaunch({ url: `/pages/admin/admin?tableId=${tableId}&userId=${encodeURIComponent(currentUserId)}&unionId=${encodeURIComponent(currentUnionId)}` })
          } else {
            wx.reLaunch({ url: `/pages/index/index?tableId=${tableId}&userId=${encodeURIComponent(currentUserId)}&unionId=${encodeURIComponent(currentUnionId)}` })
          }
        } else {
          wx.showToast({ title: '未识别到桌号', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '扫码失败', icon: 'none' })
      }
    })
  },

  async goAdmin() {
    const currentUserId = this.data.userId || app.globalData.currentOpenId || wx.getStorageSync('currentOpenId') || ''
    const currentUnionId = this.data.unionId || app.globalData.currentUnionId || wx.getStorageSync('currentUnionId') || ''
    const role = await app.verifyUserRole(currentUserId, currentUnionId)
    if (role === 'admin') {
      const tableIdToUse = this.data.selectedTableId || this.data.tableId || app.globalData.tableId || ''
      wx.navigateTo({ url: `/pages/admin/admin?tableId=${encodeURIComponent(tableIdToUse)}&userId=${encodeURIComponent(currentUserId)}&unionId=${encodeURIComponent(currentUnionId)}` })
      return
    }
    wx.showToast({ title: '当前微信用户不是管理员', icon: 'none' })
  },

  goOrderHistory() {
    wx.navigateTo({ url: '/pages/orders/orders' })
  },

  formatDate(value) {
    if (!value) return '未设置'
    return new Date(value).toLocaleString('zh-CN', { hour12: false })
  },

  formatUsed(value) {
    if (!value) return '0小时0分钟'
    return value.formatted || '0小时0分钟'
  },

  showQrCode(event) {
    const tableId = event.currentTarget.dataset.tableId
    if (!tableId) {
      wx.showToast({ title: '桌号信息缺失', icon: 'none' })
      return
    }
    const url = `${app.globalData.baseUrl}/api/tables/${encodeURIComponent(tableId)}/qrcode-image`
    this.setData({ qrCodeImageUrl: url, showQrCode: true })
  },

  hideQrCode() {
    this.setData({ showQrCode: false, qrCodeImageUrl: '' })
  },

  openAddModal() {
    this.setData({ addModalVisible: true, newTableNumber: '', addMessage: '' })
  },

  onNewTableNumberChange(e) {
    this.setData({ newTableNumber: e.detail.value })
  },

  cancelAdd() {
    this.setData({ addModalVisible: false, newTableNumber: '', addMessage: '' })
  },

  async createTable() {
    const tableNumber = String(this.data.newTableNumber || '').trim()
    if (!tableNumber) {
      wx.showToast({ title: '请输入桌台编号', icon: 'none' })
      return
    }
    const headers = {
      'x-openid': app.globalData.currentOpenId,
      'x-unionid': app.globalData.currentUnionId
    }
    const currentOpenId = app.globalData.currentOpenId || this.data.openId
    const isDevAdmin = currentOpenId === 'admin001' || currentOpenId === 'admin002'
    const isLocalDev = app.globalData.baseUrl.includes('127.0.0.1') || app.globalData.baseUrl.includes('localhost')
    if (isDevAdmin || isLocalDev) {
      headers['x-admin-token'] = app.globalData.adminToken
    }
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/tables`,
          method: 'POST',
          header: { ...headers, 'content-type': 'application/json' },
          data: { tableNumber },
          success: resolve,
          fail: reject
        })
      })
      if (res.data && res.data.ok) {
        wx.showToast({ title: '新增成功', icon: 'success' })
        this.setData({ addModalVisible: false, newTableNumber: '', addMessage: '' })
        await this.loadTables()
      } else {
        const message = res.data?.message || '新增失败'
        this.setData({ addMessage: message })
        wx.showToast({ title: message, icon: 'none' })
      }
    } catch (e) {
      console.error('createTable error', e)
      this.setData({ addMessage: '网络错误' })
      wx.showToast({ title: '网络错误', icon: 'none' })
    }
  },

  getCurrentDateTime() {
    const now = new Date()
    const pad = (n) => n < 10 ? `0${n}` : `${n}`
    const year = now.getFullYear()
    const month = pad(now.getMonth() + 1)
    const day = pad(now.getDate())
    const hour = pad(now.getHours())
    const minute = pad(now.getMinutes())
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  toPickerValue(value) {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const pad = (n) => n < 10 ? `0${n}` : `${n}`
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
  },

// 时间修改弹窗
openEditModal(e) {
  // 1. 权限控制：非管理员直接拦截
  if (this.data.role !== 'admin') {
    wx.showToast({
      title: '仅管理员可操作',
      icon: 'none',
      duration: 1500
    });
    return;
  }

  // 2. 获取桌台 ID
  const tableId = e.currentTarget.dataset.tableId;
  // 3. 从 tables 中找到该桌台数据
  const table = this.data.tables.find(item => item.id === tableId);
  if (!table) {
    wx.showToast({ title: '桌台不存在', icon: 'error' });
    return;
  }

  const currentStatusCode = table.currentOrderStatusCode || 3;
  if (currentStatusCode === 2) {
    wx.showToast({
      title: '进行中订单请直接结束，不允许修改开始/结束时间',
      icon: 'none'
    });
    return;
  }

  const now = this.getCurrentDateTime()
  const defaultStart = currentStatusCode === 1 ? now : (table.start || now)

  this.setData({
    editModalVisible: true,
    editTableId: tableId,
    editStart: defaultStart,
    editEnd: ''
  });
},

// 订单状态修改
modifyOrderStatus(e) {
    if (this.data.role !== 'admin') {
      wx.showToast({
        title: '仅管理员可操作',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    const tableId = e.currentTarget.dataset.tableId;
    const table = this.data.tables.find(item => item.id === tableId);
    const currentStatusCode = table?.currentOrder?.status ?? 3;
    console.log('tableId: %s, Current Status Code: %s', tableId, currentStatusCode);
    if (currentStatusCode !== 2) {
      wx.showToast({
        title: '仅进行中订单可修改为已结束',
        icon: 'none'
      });
      return;
    }

    wx.showActionSheet({
      itemList: ['结束当前订单'],
      success: async () => {
        await this.applyOrderStatusChange(table, '已结束')
      },
      fail: (err) => {
        console.log('取消选择', err)
      }
    })
  },

// 更新订单状态的接口调用（示例）
async updateOrderStatus(tableId, status) {
  try {
    const res = await wx.request({
      url: 'https://your-api.com/api/order/status',
      method: 'POST',
      data: { tableId, status }
    });
    if (res.data.ok) {
      wx.showToast({ title: '状态更新成功', icon: 'success' });
      // 刷新列表
      this.fetchTables();
    } else {
      wx.showToast({ title: res.data.message || '更新失败', icon: 'none' });
    }
  } catch (err) {
    wx.showToast({ title: '网络错误', icon: 'error' });
  }
},

  async applyOrderStatusChange(table, status) {
    const tableId = table.id
    const currentOrder = table.currentOrder || null
    let start = currentOrder?.start || null
    let end = currentOrder?.end || null
    const now = new Date().toISOString()

    if (status === '未开始') {
      start = null
      end = null
    } else if (status === '进行中') {
      start = currentOrder?.start || now
      end = null
    } else if (status === '已结束') {
      start = currentOrder?.start || now
      end = now
    }

    try {
      const headers = {
        'content-type': 'application/json',
        'x-openid': app.globalData.currentOpenId,
        'x-unionid': app.globalData.currentUnionId
      }
      const currentOpenId = app.globalData.currentOpenId || this.data.openId
      const isDevAdmin = currentOpenId === 'admin001' || currentOpenId === 'admin002'
      const isLocalDev = app.globalData.baseUrl.includes('127.0.0.1') || app.globalData.baseUrl.includes('localhost')
      if (isDevAdmin || isLocalDev) {
        headers['x-admin-token'] = app.globalData.adminToken
      }
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/tables/${encodeURIComponent(tableId)}`,
          method: 'PUT',
          header: headers,
          data: { start, end },
          success: resolve,
          fail: reject
        })
      })
      if (res.data && res.data.ok) {
        wx.showToast({ title: '状态已更新', icon: 'success' })
        await this.loadTables()
      } else {
        wx.showToast({ title: res.data?.message || '状态修改失败', icon: 'none' })
      }
    } catch (e) {
      console.error('applyOrderStatusChange error', e)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }
  },

  onEditStartChange(e) {
    const v = e.detail.value
    this.setData({ editStart: v })
  },

  onEditEndChange(e) {
    const v = e.detail.value
    this.setData({ editEnd: v })
  },

  async saveEdit() {
    const id = this.data.editTableId
    const start = this.data.editStart || null
    const end = this.data.editEnd || null
    if (!start) {
      wx.showToast({ title: '请先选择开始时间', icon: 'none' })
      return
    }
    const toIso = (value) => {
      if (!value) return null
      const normalized = value.replace(' ', 'T')
      const date = new Date(normalized)
      return Number.isNaN(date.getTime()) ? null : date.toISOString()
    }
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/tables/${encodeURIComponent(id)}`,
          method: 'PUT',
          header: { 'content-type': 'application/json' },
          data: { start: toIso(start), end: toIso(end) },
          success: resolve,
          fail: reject
        })
      })
      if (res.data && res.data.ok) {
        wx.showToast({ title: '修改成功', icon: 'success' })
        this.setData({ editModalVisible: false, editTableId: null, editStart: null, editEnd: null })
        await this.loadTables()
      } else {
        wx.showToast({ title: '修改失败', icon: 'none' })
      }
    } catch (e) {
      console.error('saveEdit error', e)
      wx.showToast({ title: '网络错误', icon: 'none' })
    }
  },

  cancelEdit() {
    this.setData({ editModalVisible: false, editTableId: null, editStart: null, editEnd: null })
  },

  formatDuration(item) {
    if (!item) return '0小时0分钟'
    const start = item.currentOrder?.start ? new Date(item.currentOrder.start).getTime() : null
    const end = item.currentOrder?.end ? new Date(item.currentOrder.end).getTime() : Date.now()
    if (!start) return '0小时0分钟'
    const diff = Math.max(0, end - start)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const remain = minutes % 60
    return `${hours}小时${remain}分`
  }
})