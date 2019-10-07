// pages/CityMission/CityMission.js
const utils = require('../../utils/utils.js')
import { city_missions, city_mission_buffs } from "../../database/FooData"

Page({

    /**
     * Page initial data
     */
    data: {
        missions: city_missions,
        mission_buffs: city_mission_buffs,
        searchInput: 0,
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        for (var i in this.data.missions) {
            this.data.missions[i].target_income_display = utils.numberFormat(this.data.missions[i].target_income)
        }
        this.setData({
            missions: this.data.missions
        })
    },

    /**
     * Lifecycle function--Called when page is initially rendered
     */
    onReady: function () {

    },

    /**
     * Lifecycle function--Called when page show
     */
    onShow: function () {

    },

    /**
     * Lifecycle function--Called when page hide
     */
    onHide: function () {

    },

    /**
     * Lifecycle function--Called when page unload
     */
    onUnload: function () {

    },

    /**
     * Page event handler function--Called when user drop down
     */
    onPullDownRefresh: function () {

    },

    /**
     * Called when page reach bottom
     */
    onReachBottom: function () {

    },

    /**
     * Called when user click on the top right corner to share
     */
    onShareAppMessage: function () {

    },

    //搜索输入
    oninput_search: function (e) {
        this.setData({
            searchInput: e.detail.value
        })
    },
    //搜索输入完成
    onconfirm_search: function (e) {
        for (var i in this.data.missions) {
            if(this.data.searchInput == i){
                utils.pageScrollToId(this, '#mission_' + i, 50);
                break;
            }
        }
    },
})