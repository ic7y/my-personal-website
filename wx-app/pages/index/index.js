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
    platform: '',
    openid: '',
    unionid: '',
    nickname: '',
    userMode: false,
    isTableEntry: false,
    // 首屏启动页
    splashVisible: true,
    splashChars: ['拾', '取', '手', '作'],
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
    // 首屏启动页展示 1s 后隐藏
    setTimeout(() => {
      this.setData({ splashVisible: false })
    }, 2000)
    const platform = wx.getSystemInfoSync().platform
    this.setData({ platform })
    console.log('当前 platform:', platform, 'globalData.role:', app.globalData.role)
    // 普通二维码用 tableId 参数；小程序码用 scene（形如 t=<tableId>）
    let tableId = options.tableId || ''
    if (!tableId && options.scene) {
      const scene = decodeURIComponent(String(options.scene || ''))
      const m = scene.match(/t=([^&]+)/)
      if (m && m[1]) tableId = decodeURIComponent(m[1])
    }
    const cachedOpenId = options.userId || app.globalData.openid || wx.getStorageSync('openid') || ''
    const cachedUnionId = options.unionId || app.globalData.unionid || wx.getStorageSync('unionid') || ''

    const loginState = cachedOpenId || cachedUnionId
      ? { openid: cachedOpenId, unionid: cachedUnionId, isLoggedIn: true }
      : await app.ensureLoginOnEntry()

    const openid = loginState.openid || cachedOpenId
    const unionid = loginState.unionid || cachedUnionId

    app.globalData.openid = openid
    app.globalData.unionid = unionid
    this.setData({ tableId, selectedTableId: '', isTableEntry: !!options.tableId })
    this.refreshIdentity()

    if (!openid && !unionid) {
      this.setData({ role: 'guest' })
      app.globalData.role = 'guest'
      return
    }

    await this.loadTables()

    const role = app.globalData.role || await app.verifyUserRole(openid, unionid)
    this.setData({ role })
    app.globalData.role = role

    // 管理员不再跳转独立 admin 页，直接在 index 页内完成管理操作
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
    // 从其他页面（如历史订单）返回：退出普通用户模式，恢复管理员身份
    if (this.data.userMode) {
      this.setData({ userMode: false })
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

    console.log('loadTables called', { openid: app.globalData.openid, unionid: app.globalData.unionid, role: app.globalData.role })
    this.setData({ loading: true, error: '' })
    try {
      const headers = {
        'x-openid': app.globalData.openid,
        'x-unionid': app.globalData.unionid
      }
      const isLocalDev = app.globalData.baseUrl.includes('127.0.0.1') || app.globalData.baseUrl.includes('localhost')
      if (isLocalDev) {
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
              currentOrderStatus: item.currentOrderStatus || '无订单',
              currentOrderStatusCode: item.currentOrderStatusCode ?? 3
            }))
          ))
          console.log('loadTables set tables', tables)

          // 全部数据一次性平铺set，不要任何嵌套回调
          const isLocalDev = app.globalData.baseUrl.includes('127.0.0.1') || app.globalData.baseUrl.includes('localhost')
          // 真实身份：本地开发(devtools)强制管理员，否则用全局已判定身份
          const trueRole = (app.globalData.role === 'admin' || isLocalDev) ? 'admin' : (app.globalData.role || 'user')
          // 视图身份：普通用户模式下锁定为 user（不写入全局真实身份）
          const viewRole = this.data.userMode ? 'user' : trueRole

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

          // 扫码进入（带 tableId）：只展示该桌台的订单信息
          const displayTables = this.data.isTableEntry && matchTable ? [matchTable] : tables

          // ========= 重点：所有数据一次性批量set，无嵌套 =========
          this.setData({
            tables: displayTables,
            role: viewRole,
            table: matchTable
          })
          app.globalData.role = trueRole
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
    const openid = app.globalData.openid || wx.getStorageSync('openid') || ''
    const unionid = app.globalData.unionid || wx.getStorageSync('unionid') || ''
    if (openid) {
      const role = await app.verifyUserRole(openid, unionid)
      this.setData({ role })
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
      const openid = result?.openid || app.globalData.openid || wx.getStorageSync('openid') || ''
      const unionid = result?.unionid || app.globalData.unionid || wx.getStorageSync('unionid') || ''
      if (!openid) {
        wx.showToast({ title: '登录失败：未获取 openid', icon: 'none' })
        this.setData({ loginResult: '登录失败：未获取 openid' })
        return false
      }
      const role = await app.verifyUserRole(openid, unionid)
      console.log('loginWithWechat role', { openid, unionid, role })
      this.setData({ role, loginResult: `登录成功: ${openid}` })
      app.globalData.openid = openid
      app.globalData.unionid = unionid
      app.globalData.role = role
      wx.setStorageSync('openid', openid)
      wx.setStorageSync('unionid', unionid)
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
    const openid = app.globalData.openid || wx.getStorageSync('openid') || ''
    const unionid = app.globalData.unionid || wx.getStorageSync('unionid') || ''
    let role = app.globalData.role || this.data.role
    const message = success
      ? `登录成功: ${openid || 'openid 未获取'} / ${unionid || 'unionid 未获取'}`
      : '登录失败，请查看后台日志'
    console.log('authorizeLogin result', { success, openid, unionid, role })
    this.setData({ role, loginResult: message })
    wx.showToast({ title: message, icon: success ? 'success' : 'none' })

    if (!success) return

    const roleRefresh = await app.verifyUserRole(openid, unionid)
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
    if (!app.globalData.openid && !wx.getStorageSync('openid')) {
      const loggedIn = await this.loginWithWechat()
      if (!loggedIn) return
    }

    wx.scanCode({
      onlyFromCamera: true,
      success: async (res) => {
        const tableId = this.extractTableId(res.result || '')
        if (tableId) {
          app.globalData.tableId = tableId
          this.setData({ tableId })
          await this.loadTables()
        } else {
          wx.showToast({ title: '未识别到桌号', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '扫码失败', icon: 'none' })
      }
    })
  },

  goOrderHistory() {
    wx.navigateTo({ url: '/pages/orders/orders' })
  },

  // 切换到普通用户模式：锁定 userMode，隐藏管理员操作入口，并重新加载数据
  // 注意：不修改 app.globalData.role（全局真实身份保持为 admin），仅切换本页视图
  switchToUserMode() {
    this.setData({ role: 'user', userMode: true })
    this.loadTables()
    wx.showToast({ title: '已切换到普通用户模式', icon: 'none' })
  },

  formatDate(value) {
    if (!value) return '未设置'
    return new Date(value).toLocaleString('zh-CN', { hour12: false })
  },

  // 从全局或缓存中读取昵称
  getNickname() {
    const userInfo = app.globalData.userInfo
    if (userInfo && userInfo.nickName) return userInfo.nickName
    try {
      const cached = wx.getStorageSync('userInfo')
      const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
      return (parsed && parsed.nickName) || ''
    } catch (e) {
      return ''
    }
  },

  // 刷新调试面板需要的身份信息
  refreshIdentity() {
    this.setData({
      openid: app.globalData.openid || wx.getStorageSync('openid') || '',
      unionid: app.globalData.unionid || wx.getStorageSync('unionid') || '',
      nickname: this.getNickname()
    })
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
      'x-openid': app.globalData.openid,
      'x-unionid': app.globalData.unionid
    }
    const openid = app.globalData.openid
    const isDevAdmin = openid === 'admin001' || openid === 'admin002'
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
  // 1. 权限控制：非管理员直接拦截（普通用户模式静默返回，不出现提示）
  // 注意：用视图身份 this.data.role 判断，普通用户模式下为 'user'
  if (this.data.role !== 'admin') {
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

  const currentStatusCode = table.currentOrderStatusCode ?? 3;
  // 已结束订单不可修改时间
  if (currentStatusCode === 1) {
    wx.showToast({ title: '已结束订单不可修改时间', icon: 'none' });
    return;
  }
  // 进行中/未开始/无订单均可修改开始、结束时间

  const now = this.getCurrentDateTime()
  const defaultStart = table.start || now
  // 进行中订单若已设置结束时间则预填
  const defaultEnd = table.currentOrder?.end ? this.toPickerValue(table.currentOrder.end) : ''

  this.setData({
    editModalVisible: true,
    editTableId: tableId,
    editStart: defaultStart,
    editEnd: defaultEnd
  });
},

// 订单状态修改
modifyOrderStatus(e) {
    // 权限控制：非管理员静默返回，不出现提示（用视图身份判断）
    if (this.data.role !== 'admin') {
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

  // 新订单：仅已结束订单可开新单，确认后创建进行中订单（开始时间=当前时间）
  openNewOrder(e) {
    // 权限控制：仅管理员（普通用户模式静默返回）
    if (this.data.role !== 'admin') {
      return;
    }
    const tableId = e.currentTarget.dataset.tableId;
    const tableNumber = e.currentTarget.dataset.tableNumber || '';
    const table = this.data.tables.find(item => item.id === tableId);
    if (!table) return;
    const statusCode = table.currentOrderStatusCode ?? 3;
    if (statusCode !== 1) {
      wx.showToast({ title: '仅已结束订单可开新订单', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '新订单',
      content: `为桌号「${tableNumber}」开新订单？开始时间将设为当前时间。`,
      confirmText: '确定',
      cancelText: '取消',
      success: async (res) => {
        if (!res.confirm) return;
        await this.createNewOrder(table);
      }
    });
  },

  async createNewOrder(table) {
    try {
      const headers = {
        'content-type': 'application/json',
        'x-openid': app.globalData.openid,
        'x-unionid': app.globalData.unionid
      }
      const openid = app.globalData.openid
      const isDevAdmin = openid === 'admin001' || openid === 'admin002'
      const isLocalDev = app.globalData.baseUrl.includes('127.0.0.1') || app.globalData.baseUrl.includes('localhost')
      if (isDevAdmin || isLocalDev) {
        headers['x-admin-token'] = app.globalData.adminToken
      }
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/tables/${encodeURIComponent(table.id)}`,
          method: 'PUT',
          header: headers,
          data: { start: new Date().toISOString() },
          success: resolve,
          fail: reject
        })
      })
      if (res.data && res.data.ok) {
        wx.showToast({ title: '新订单已创建', icon: 'success' });
        await this.loadTables();
      } else {
        wx.showToast({ title: res.data?.message || '开单失败', icon: 'none' });
      }
    } catch (e) {
      console.error('createNewOrder error', e);
      wx.showToast({ title: '网络错误', icon: 'none' });
    }
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
        'x-openid': app.globalData.openid,
        'x-unionid': app.globalData.unionid
      }
      const openid = app.globalData.openid
      const isDevAdmin = openid === 'admin001' || openid === 'admin002'
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
