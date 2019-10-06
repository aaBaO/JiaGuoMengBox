//app.js
import default_self_configs from './database/DefaultSelfConfigs'

App({
  globalData: {
    self_configs: null,
  },

  onLaunch: function () {
    // 本地存储个人配置
    this.globalData.self_configs = wx.getStorageSync('self_configs');
    if (!this.globalData.self_configs) {
      this.globalData.self_configs = default_self_configs.Configs
      wx.setStorageSync('self_configs', this.globalData.self_configs);
    }
  },
})