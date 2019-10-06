// pages/CityMission/CityMission.js
const utils = require('../../utils/utils.js')
Page({

  /**
   * Page initial data
   */
  data: {
    missions: [
      {
        id: 0,
        name: "阶段1",
        buff_list: ["buff1, buff2, buff3", "buff4, buff5, buff6"],
        target: "adaf",
        reward: "adf"
      },
      {
        id: 1,
        name: "阶段2",
        buff_list: ["buff1, buff2, buff3", "buff4, buff5, buff6"],
        target: "adaf",
        reward: "adf"
      },
      {
        id: 2,
        name: "阶段3",
        buff_list: ["buff1, buff2, buff3", "buff4, buff5, buff6"],
        target: "adaf",
        reward: "adf"
      },
      {
        id: 3,
        name: "阶段4",
        buff_list: ["buff1, buff2, buff3", "buff4, buff5, buff6"],
        target: "adaf",
        reward: "adf"
      },
      {
        id: 4,
        name: "阶段5",
        buff_list: ["buff1, buff2, buff3", "buff4, buff5, buff6"],
        target: "adaf",
        reward: "adf"
      },
    ],
    searchInput: '',
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {

  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {

  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function() {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {

  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {

  },

  //搜索输入
  oninput_search: function(e) {
    this.setData({
      searchInput: e.detail.value
    })
  },
  //搜索输入完成
  onconfirm_search: function(e) {
    const patt = new RegExp(this.data.searchInput);
    for (var i in this.data.missions) {
      const mission = this.data.missions[i];
      // console.log(mission, patt.test(mission.name));
      if (patt.test(mission.name)) {
        utils.pageScrollToId(this, '#mission_' + i);
        break;
      }
    }
  },
})