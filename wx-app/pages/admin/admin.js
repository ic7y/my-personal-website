const app = getApp()

Page({
  data: {
    tableId: '',
    table: null,
    loading: false,
    start: '',
    end: '',
    message: '',
    userId: '',
    isAdmin: false
  },

  async onLoad(options) {
    console.log('admin onLoad options', options)
    const tableId = options.tableId || app.globalData.tableId || ''
    const userId = options.userId || app.globalData.currentUserId || wx.getStorageSync('currentUserId') || ''
    console.log('admin onLoad identity', { tableId, userId })
    const role = await app.verifyUserRole(userId)
    const hasAdmin = role === 'admin'
    console.log('admin onLoad role', { role, hasAdmin })
    this.setData({ tableId, userId, isAdmin: hasAdmin })
    app.globalData.currentUserId = userId
    app.globalData.role = role
    if (tableId && hasAdmin) {
      await this.loadTable()
    } else if (!tableId && hasAdmin) {
      this.setData({ message: '管理员已登录，请扫码或携带 tableId 进入本页面' })
    }
  },

  async loadTable() {
    const { tableId } = this.data
    console.log('admin loadTable start', { tableId })
    if (!tableId) {
      this.setData({ loading: false, message: '缺少桌号参数' })
      return
    }
    this.setData({ loading: true, message: '' })
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/tables/${tableId}`,
          method: 'GET',
          success: resolve,
          fail: reject
        })
      })
      console.log('admin loadTable response', res)
      if (res.data && res.data.ok) {
        const table = res.data.data
        const latestOrder = Array.isArray(table.orders) && table.orders.length ? table.orders[table.orders.length - 1] : null
        this.setData({
          table,
          loading: false,
          start: this.toInputValue(latestOrder?.start),
          end: this.toInputValue(latestOrder?.end)
        })
      } else {
        this.setData({ loading: false, message: res.data?.message || '加载失败' })
      }
    } catch (e) {
      console.error('admin loadTable error', e)
      this.setData({ loading: false, message: '加载失败' })
    }
  },

  toInputValue(value) {
    if (!value) return ''
    const date = new Date(value)
    const pad = (n) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  },

  async loginAdmin() {
    const userId = String(this.data.userId || '').trim()
    const role = await app.verifyUserRole(userId)
    if (role === 'admin') {
      app.globalData.currentUserId = userId
      app.globalData.role = 'admin'
      wx.setStorageSync('currentUserId', userId)
      this.setData({ isAdmin: true, message: '管理员身份已确认' })
      if (this.data.tableId) this.loadTable()
    } else {
      this.setData({ message: '当前微信用户不是管理员' })
    }
  },

  bindStartChange(e) {
    this.setData({ start: e.detail.value })
  },

  bindEndChange(e) {
    this.setData({ end: e.detail.value })
  },

  extractTableId(text) {
    if (!text) return ''
    const match = text.match(/(?:^|[?&])tableId=([^&]+)/i)
    if (match && match[1]) return decodeURIComponent(match[1])
    const pageMatch = text.match(/\/pages\/(?:index|table)\/index\?tableId=([^&]+)/i)
    if (pageMatch && pageMatch[1]) return decodeURIComponent(pageMatch[1])
    return ''
  },

  scanQrCode() {
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        const tableId = this.extractTableId(res.result || '')
        if (tableId) {
          this.setData({ tableId })
          this.loadTable()
        } else {
          wx.showToast({ title: '未识别到桌号', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '扫码失败', icon: 'none' })
      }
    })
  },

  async saveSchedule() {
    if (!this.data.isAdmin) {
      this.setData({ message: '请先登录管理员' })
      return
    }
    const { tableId, start, end } = this.data
    try {
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/tables/${tableId}`,
          method: 'PUT',
          data: {
            start: start ? new Date(start).toISOString() : null,
            end: end ? new Date(end).toISOString() : null
          },
          success: resolve,
          fail: reject
        })
      })
      if (res.data && res.data.ok) {
        this.setData({ table: res.data.data, message: '设置已保存' })
      } else {
        this.setData({ message: '保存失败' })
      }
    } catch (e) {
      this.setData({ message: '保存失败' })
    }
  }
})
