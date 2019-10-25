// pages/SetConfigs/SetConfigs.js
import FooData from '../../database/FooData'
import { clampNumber } from '../../utils/utils'

const app = getApp();

Page({

    /**
     * Page initial data
     */
    data: {
        buff_type: FooData.buff_type,
        policy_list: FooData.policy_list,
        building_type: FooData.building_type,
        buildings_list: FooData.buildings_list,
        level_limit: FooData.level_limit,
        level_income: FooData.level_income,
        level_cost: FooData.level_cost,

        temp_settings: {
            policies: {},
            buildings: {},
            albums: {},
            city_missions: {
                buff:{},
                building:[
                    { id:0, value:0, index:0},
                    { id:0, value:0, index:0},
                    { id:0, value:0, index:0},
                ],
            },
            extra_buff: {},
        },

        building_rare_wxssclass:[
            'normal',
            'epic',
            'legend'
        ],
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        // console.log(app.globalData.self_configs)

        //初始化临时设置
        //家国之光，活动buff
        for (var buff_type in this.data.buff_type) {
            const buff_item = this.data.buff_type[buff_type];
            const saved_data = app.globalData.self_configs.extra_buff[buff_item.id];
            var temp_extrabuff_setting = {
                value: saved_data ? saved_data.value : 0,
            }
            this.data.temp_settings.extra_buff[buff_item.id] = temp_extrabuff_setting;
        }
        //政策设置
        for (var stage_index in this.data.policy_list) {
            const stage_item = this.data.policy_list[stage_index];
            for (var policy_index in stage_item) {
                const policy_item = stage_item[policy_index];
                const saved_data = app.globalData.self_configs.policies[policy_item.id];
                var temp_policy_setting = {
                    level: saved_data ? saved_data.level : 0,
                }
                this.data.temp_settings.policies[policy_item.id] = temp_policy_setting;
            }
        }
        //相册设置
        for (var buff_type in this.data.buff_type) {
            const buff_item = this.data.buff_type[buff_type];
            const saved_data = app.globalData.self_configs.albums[buff_item.id];
            var temp_albums_setting = {
                value: saved_data ? saved_data.value : 0,
            }
            this.data.temp_settings.albums[buff_item.id] = temp_albums_setting;
        }
        //城市任务设置
        for (var buff_type in this.data.buff_type) {
            const buff_item = this.data.buff_type[buff_type];
            const saved_data = app.globalData.self_configs.city_missions.buff[buff_item.id];
            var temp_mission_buff_setting = {
                value: saved_data ? saved_data.value : 0,
            }
            this.data.temp_settings.city_missions.buff[buff_item.id] = temp_mission_buff_setting;
        }
        for (var i in this.data.temp_settings.city_missions.building) {
            const saved_data = app.globalData.self_configs.city_missions.building[i];
            var temp_mission_build_setting = {
                id: saved_data ? saved_data.id : 0,
                value: saved_data ? saved_data.value : 0,
                index: saved_data ? saved_data.index : 0,
            }
            this.data.temp_settings.city_missions.building[i] = temp_mission_build_setting;
        }

        //建筑设置
        for (var i in this.data.buildings_list) {
            const buildings_item = this.data.buildings_list[i];
            const saved_data = app.globalData.self_configs.buildings[buildings_item.id];
            var temp_buildings_setting = {
                enabled: saved_data ? saved_data.enabled : true,
                star_level: saved_data ? saved_data.star_level : 0,
                level: saved_data ? saved_data.level : 0,
            }
            this.data.temp_settings.buildings[buildings_item.id] = temp_buildings_setting;
        }
        this.setData({
            temp_settings: this.data.temp_settings
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
        return{
            title:"家国梦小助手",
            path:"/pages/index/index",
        }
    },

    //家国之光
    onInput_ExtraBuff:function(event){
        var value = Math.max(0, parseInt(event.detail.value) || 0)
        this.data.temp_settings.extra_buff[event.currentTarget.dataset.bufftype].value = value;
        this.setData({
            temp_settings: this.data.temp_settings
        })
        return {
            value: value
        }
    },

    // 设置政策等级
    onSet_PolicyLevel: function (event) {
        this.data.temp_settings.policies[event.currentTarget.dataset.policyid].level = event.detail.value;
        this.setData({
            temp_settings: this.data.temp_settings
        })
    },

    // 设置相册加成
    onInput_Album: function (event) {
        var value = Math.max(0, parseInt(event.detail.value) || 0)
        this.data.temp_settings.albums[event.currentTarget.dataset.bufftype].value = value;
        this.setData({
            temp_settings: this.data.temp_settings
        })
        return {
            value: value
        }
    },

    //设置城市任务
    onInput_CityMission: function (event) {
        const type = event.currentTarget.dataset.inputtype;
        const inputid = event.currentTarget.dataset.inputid;
        const inputindex = event.currentTarget.dataset.inputindex;

        var value = Math.max(0, parseInt(event.detail.value) || 0)

        var array = this.data.temp_settings.city_missions[type];
        if (type === "buff") {
            array[inputid] = {
                value:value
            }
        }

        if (type === "building") {
            array[inputindex].id = inputid
            array[inputindex].value = value
        }

        this.setData({
            temp_settings: this.data.temp_settings
        })
        return {
            value: value
        }
    },

    //设置城市任务加成的建筑
    onPick_CityMissionBuffBuilding: function (event) {
        this.data.temp_settings.city_missions.building[event.currentTarget.dataset.keyindex].index = event.detail.value
        this.setData({
            temp_settings: this.data.temp_settings
        })
    },

    // 设置建筑计算开关
    onSwitch_BuildingEnabled: function (event) {
        this.data.temp_settings.buildings[event.currentTarget.dataset.buildingsid].enabled = event.detail.value;
        this.setData({
            temp_settings: this.data.temp_settings
        })
    },

    onSet_BuildingStarLevel: function (event) {
        this.data.temp_settings.buildings[event.currentTarget.dataset.buildingsid].star_level = event.detail.value;
        this.setData({
            temp_settings: this.data.temp_settings
        })
    },

    onInput_BuildingLevel: function (event) {
        var level = clampNumber(parseInt(event.detail.value) || 0, 0, this.data.level_limit)
        this.data.temp_settings.buildings[event.currentTarget.dataset.buildingsid].level = level;
        this.setData({
            temp_settings: this.data.temp_settings
        })
        return {
            value: level
        }
    },

    onClickSaveConfigs: function () {
        app.globalData.self_configs.name = "个人设置";
        //保存家国之光,活动buff设置
        app.globalData.self_configs.extra_buff = this.data.temp_settings.extra_buff;
        //保存政策设置
        app.globalData.self_configs.policies = this.data.temp_settings.policies;
        //保存相册设置
        app.globalData.self_configs.albums = this.data.temp_settings.albums;
        //保存城市任务设置
        app.globalData.self_configs.city_missions = this.data.temp_settings.city_missions;
        //保存建筑设置
        app.globalData.self_configs.buildings = this.data.temp_settings.buildings;
        wx.setStorageSync('self_configs', app.globalData.self_configs);

        wx.showToast({
            title:"保存成功",
            icon:"success",
            duration:1500,
        })
    },
})