App({
  globalData: {
    // 使用本机本地地址调试，避免真机预览时 localhost 解析到手机自身
    baseUrl: 'http://127.0.0.1:3000',
    role: 'user',
    tableId: '',
    currentOpenId: '',
    currentUnionId: '',
    currentUserId: '',
    userInfo: null,
    adminOpenIds: ['admin001', 'admin002'],
    adminToken: 'changeme'
  },
  onLaunch() {
    console.log('微信小程序启动')
    const cachedOpenId = wx.getStorageSync('currentOpenId') || ''
    const cachedUnionId = wx.getStorageSync('currentUnionId') || ''
    if (cachedOpenId) {
      this.globalData.currentOpenId = cachedOpenId
      this.globalData.currentUserId = cachedOpenId
    }
    if (cachedUnionId) {
      this.globalData.currentUnionId = cachedUnionId
    }
  },
  isAdminUserId(userId) {
    const normalized = String(userId || '').trim()
    return this.globalData.adminOpenIds.includes(normalized)
  },
  async verifyUserRole(openid, unionid) {
    try {
      const headers = {
        'x-openid': openid || this.globalData.currentOpenId,
        'x-unionid': unionid || this.globalData.currentUnionId
      }
      const res = await new Promise((resolve, reject) => {
        wx.request({
          url: `${this.globalData.baseUrl}/api/me/role`,
          method: 'GET',
          header: headers,
          success: resolve,
          fail: reject
        })
      })
      return res.data && res.data.ok ? res.data.role : 'user'
    } catch (e) {
      return 'user'
    }
  },
  async loginWechatUser() {
    const loginPromise = () => new Promise((resolve, reject) => {
      wx.login({ success: resolve, fail: reject })
    })

    const requestPromise = (options) => new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success: resolve,
        fail: (err) => {
          console.error('wx.request failed', err)
          reject(err)
        }
      })
    })

    const getUserProfilePromise = () => new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于识别当前微信用户身份',
        success: resolve,
        fail: reject
      })
    })

    try {
      console.log('loginWechatUser start')
      const loginRes = await loginPromise()
      console.log('loginWechatUser wx.login', loginRes)
      if (!loginRes.code) return { openid: '', unionid: '' }

      const authRes = await requestPromise({
        url: `${this.globalData.baseUrl}/api/wechat/login`,
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: { code: loginRes.code }
      })
      console.log('loginWechatUser authRes', authRes)

      const openid = authRes.data?.data?.openid || `wx_${loginRes.code}`
      const unionid = authRes.data?.data?.unionid || ''
      let userInfo = {}

      try {
        const profile = await getUserProfilePromise()
        userInfo = profile.userInfo || {}
      } catch (profileError) {
        console.warn('loginWechatUser getUserProfile failed', profileError)
      }

      this.globalData.userInfo = userInfo
      this.globalData.currentOpenId = openid
      this.globalData.currentUnionId = unionid
      this.globalData.currentUserId = openid
      wx.setStorageSync('currentOpenId', openid)
      if (unionid) wx.setStorageSync('currentUnionId', unionid)
      if (Object.keys(userInfo).length) wx.setStorageSync('userInfo', JSON.stringify(userInfo))

      return { openid, unionid }
    } catch (e) {
      console.error('wechat login failed', e)
      return { openid: '', unionid: '' }
    }
  }
})
