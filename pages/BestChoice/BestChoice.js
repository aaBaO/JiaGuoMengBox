// pages/BestChoice/BestChoice.js
import utils from "../../utils/utils"
import FooData from '../../database/FooData'

const self_configs = getApp().globalData.self_configs

Page({

    /**
     * Page initial data
     */
    data: {
        // 计算离线在线标记,默认计算在线
        online_flag: true,
        allBaseIncome: {},
        allPolicyBuff: {},

        computing: false,
        compute_cost_time: 0,
        current_count: 0,
        max_count: 0,
    },

    compute_worker: "undefined",
    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        this.compute_worker = this.startWorker(this)
        this.compute_worker.postMessage({
            msg: "setData",
            data: {
                db: FooData,
                self_configs: self_configs,
            }
        })

        console.log("onload")
    },

    startWorker: function (page) {
        console.log(page.setData)
        var worker = wx.createWorker('workers/compute.js')
        if (worker) {
            worker.onMessage(function (res) {
                // console.log(res)

                if (res.msg === "returnBestCombination") {
                    page.setData({
                        computing: false,
                        compute_cost_time: res.data.cost_time
                    })
                } else if(res.msg === "returnComputProgress"){
                    page.data.current_count = res.data.current_count
                    page.data.max_count = res.data.max_count
                }
            })
        }
        return worker
    },

    stopWorker: function (worker) {
        if (worker) {
            worker.terminate()
        }
    },

    startTimer: function (page) {
        var timer = setInterval(() => {
            page.setData({
                current_count: page.data.current_count,
                max_count: page.data.max_count
            })
            if(page.data.current_count >= page.data.max_count){
                clearInterval(timer)
            }
        }, 100)
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

        console.log("hide")
    },

    /**
     * Lifecycle function--Called when page unload
     */
    onUnload: function () {
        console.log("unload")
        this.stopWorker(this.compute_worker)
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

    onSwitch_OnlineFlag: function (event) {
        this.setData({
            online_flag: event.detail.value,
            filter_buff_type: event.detail.value ? 3 : 2,
        })
    },

    onClick_StartCalc: function () {

        this.compute_worker.postMessage({
            msg: "getBestCombination",
            data: {
                online_flag: this.data.online_flag
            }
        })
        this.startTimer(this)

        this.setData({
            computing: true,
        })
    }
})