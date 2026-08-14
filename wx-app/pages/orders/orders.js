const app = getApp()

Page({
  data: {
    filterTableNumber: '',
    filterDate: '',
    orders: [],
    error: '',
    loaded: false
  },

  onLoad() {
    // 可根据需要预填 tableId
    const tableId = app.globalData.tableId || ''
    if (tableId) {
      this.setData({ filterTableNumber: tableId })
    }
  },

  onFilterTableNumberChange(e) {
    this.setData({ filterTableNumber: e.detail.value })
  },

  onFilterDateChange(e) {
    this.setData({ filterDate: e.detail.value })
  },

  async searchOrders() {
    this.setData({ error: '', loaded: false })
    try {
      const query = []
      if (this.data.filterTableNumber) {
        query.push(`tableNumber=${encodeURIComponent(this.data.filterTableNumber.trim())}`)
      }
      if (this.data.filterDate) {
        query.push(`date=${encodeURIComponent(this.data.filterDate.trim())}`)
      }
      const queryString = query.length ? `?${query.join('&')}` : ''
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${app.globalData.baseUrl}/api/orders${queryString}`,
          method: 'GET',
          success: resolve,
          fail: reject
        })
      })
      if (res.data && res.data.ok) {
        // 按开始时间降序排列，开始时间为空的排最后
        const sorted = (res.data.data || []).slice().sort((a, b) => {
          const ta = a.start ? new Date(a.start).getTime() : -Infinity
          const tb = b.start ? new Date(b.start).getTime() : -Infinity
          return tb - ta
        })
        this.setData({ orders: sorted, loaded: true })
      } else {
        this.setData({ error: res.data?.message || '查询失败', loaded: true })
      }
    } catch (e) {
      console.error('searchOrders error', e)
      this.setData({ error: '网络错误', loaded: true })
    }
  }
})
