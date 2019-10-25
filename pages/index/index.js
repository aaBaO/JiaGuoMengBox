//index.js
//获取应用实例
const app = getApp()

Page({
    data: {

    },
    onShareAppMessage: function () {
        return{
            title:"家国梦小助手",
            path:"/pages/index/index",
        }
    },
    onclick_set_configs: function () {
        wx.navigateTo({
            url: '../SetConfigs/SetConfigs',
        })
    },
    onclick_best_choice: function () {
        wx.navigateTo({
            url: '../BestChoice/BestChoice',
        })
    },
    onclick_city_mission: function () {
        wx.navigateTo({
            url: '../CityMission/CityMission',
        })
    },
    onclick_policy_preview: function () {
        wx.navigateTo({
            url: '../PolicyPreview/PolicyPreview',
        })
    },
    onclick_album: function () {
        wx.navigateTo({
            url: '../PolicyPreview/PolicyPreview',
        })
    },
})
