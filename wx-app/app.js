App({
  globalData: {
    baseUrl: '', // 启动时自动赋值，不写死
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
    // 启动时先计算接口基地址
    this.globalData.baseUrl = this.getBaseUrl()
    console.log('当前环境 baseUrl:', this.globalData.baseUrl)

    // 你原本的缓存恢复逻辑保持不变
    const cachedOpenId = wx.getStorageSync('currentOpenId') 
    const cachedUnionId = wx.getStorageSync('currentUnionId') 
    if (cachedOpenId) {
      this.globalData.currentOpenId = cachedOpenId
      this.globalData.currentUserId = cachedOpenId
    }
    if (cachedUnionId) {
      this.globalData.currentUnionId = cachedUnionId
    }
  },

  // 核心：环境判断方法
  getBaseUrl() {
    // 1. 先判断发布版本：体验版、正式版 强制用线上域名
    const envVersion = __wxConfig.envVersion
    if (envVersion === 'release' || envVersion === 'trial') {
      return 'https://windx.cloud'
    }

    // 2. 开发版本：判断是电脑模拟器还是手机真机
    const { platform } = wx.getSystemInfoSync()
    if (platform === 'devtools') {
      // 电脑开发者工具：用本地地址
      return 'http://localhost:8080'
    } else {
      // 手机真机（包括真机调试）：自动切换线上域名
      return 'https://windx.cloud'
    }
  },
  async ensureLoginOnEntry() {
    const cachedOpenId = this.globalData.currentOpenId || wx.getStorageSync('currentOpenId') 
    const cachedUnionId = this.globalData.currentUnionId || wx.getStorageSync('currentUnionId') 

    if (cachedOpenId || cachedUnionId) {
      return { openid: cachedOpenId, unionid: cachedUnionId, isLoggedIn: true }
    }

    return new Promise((resolve) => {
      wx.showModal({
        title: '微信登录',
        content: '为识别当前微信用户身份并区分管理员，需要获取 openid/unionid。是否立即授权登录？',
        confirmText: '授权登录',
        cancelText: '暂不登录',
        success: async (res) => {
          if (!res.confirm) {
            resolve({ openid: '', unionid: '', isLoggedIn: false })
            return
          }

          const result = await this.loginWechatUser()
          if (!result.openid) {
            wx.showToast({ title: '登录失败：未获取 openid', icon: 'none' })
            resolve({ openid: '', unionid: '', isLoggedIn: false })
            return
          }

          const role = await this.verifyUserRole(result.openid, result.unionid)
          this.globalData.role = role
          wx.showToast({ title: role === 'admin' ? '管理员身份已确认' : '登录成功', icon: 'success' })
          resolve({ openid: result.openid, unionid: result.unionid, isLoggedIn: true, role })
        },
        fail: () => {
          resolve({ openid: '', unionid: '', isLoggedIn: false })
        }
      })
    })
  },
  isAdminUserId(userId) {
    const normalized = String(userId || '').trim()
    return this.globalData.adminOpenIds.includes(normalized) || normalized.toLowerCase().startsWith('admin')
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
