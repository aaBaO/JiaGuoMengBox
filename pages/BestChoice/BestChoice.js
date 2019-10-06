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
        //默认过滤离线buff
        filter_buff_type: 3,
        industry_buildings:[],
        business_buildings:[],
        residence_buildings:[],

        computing: false,
        compute_cost_time: 0,
        current_progress:0,
        max_progress:0,
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        for(var i in FooData.buildings_list){
            var building = FooData.buildings_list[i]
            if(building.type == 1){
                this.data.industry_buildings.push(building)
            }
            if(building.type == 2){
                this.data.business_buildings.push(building)
            }
            if(building.type == 3){
                this.data.residence_buildings.push(building)
            }
        }
    },

    getBaseIncome:function(building_id, level){
        var building = FooData.getBuildingData(building_id)
        return building.income_offset * 0.01 * FooData.level_income[level]
    },

    getStarBuff:function(star_level){
        return FooData.star_offset[star_level] * 0.01       
    },

    //建筑间加成,互相在阵容内才有加成
    getBuildingBuff:function(building_id){
        var result = 100
        //先计算阵容内所有加成
        // for(var i in FooData.buildings_list){
        //     const building = FooData.buildings_list[i]
        //     if(building.benefit_list){
        //         for(var j in building.benefit_list){
        //             if(building.benefit_list[j].building_id == building_id){
        //                 var offset = self_configs.buildings[building.id].star_level
        //                 result += building.benefit_list[j].value[offset]
        //             }
        //         }
        //     }
        //     if(building.buff_type){
        //         for(var j in building.buff_type){
        //             var buff_item = FooData.getBuffData(building.buff_type[j].bufftype)
        //             if(buff_item.id == this.data.filter_buff_type){
        //                 continue;
        //             }
        //             if(buff_item.affect_building.indexOf(building.type) > -1){
        //                 var level = self_configs.policies[policy_id].level
        //                 result += policy.enhance_value[level]
        //             }
        //         }
        //     }
        // }
        result = 1050
        return result * 0.01 
    },

    getPolicyBuff:function(building_id){
        var result = 100
        var building = FooData.getBuildingData(building_id)
        for(var policy_id in self_configs.policies){
            var policy = FooData.getPolicyData(policy_id)
            var buff_item = FooData.getBuffData(policy.buff_type)
            if(buff_item.id == this.data.filter_buff_type){
                continue;
            }
            if(buff_item.affect_building.indexOf(building.type) > -1){
                var level = self_configs.policies[policy_id].level
                result += policy.enhance_value[level]
            }
        }

        for(var buff_type in self_configs.extra_buff){
            var buff_item = FooData.getBuffData(buff_type)
            if(buff_item.id == this.data.filter_buff_type){
                continue;
            }
            if(buff_item.affect_building.indexOf(building.type) > -1){
                result += self_configs.extra_buff[buff_type].value
            }
        }

        return result * 0.01
    },

    getAlbumBuff:function(building_id){
        var result = 100
        var building = FooData.getBuildingData(building_id)
        for(var buff_type in self_configs.albums){
            var buff_item = FooData.getBuffData(buff_type)
            if(buff_item.id == this.data.filter_buff_type){
                continue;
            }
            if(buff_item.affect_building.indexOf(building.type) > -1){
                result += self_configs.albums[buff_type].value
            }
        }
        return result * 0.01
    },

    getCityMissionBuff:function(building_id){
        var result = 100
        var building = FooData.getBuildingData(building_id)
        var city_buffs = self_configs.city_missions.buff
        var city_building_enhance = self_configs.city_missions.building

        for(var buff_type in city_buffs){
            var buff_item = FooData.getBuffData(buff_type)
            if(buff_item.id == this.data.filter_buff_type){
                continue;
            }
            if(buff_item.affect_building.indexOf(building.type) > -1){
                result += city_buffs[buff_type].value
            }
        }

        for(var i in city_building_enhance){
            if(city_building_enhance[i].id == building_id){
                result += city_building_enhance[i].value
            }
        }
        return result * 0.01
    },

    getExtraBuff:function(building_id){
        var result = 100
        var building = FooData.getBuildingData(building_id)
        return result * 0.01
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

    onSwitch_OnlineFlag:function(event){
        this.setData({
            online_flag: event.detail.value,
            filter_buff_type: event.detail.value ? 3:2,
        })
    },

    onClick_StartCalc:function(event){
        //单个建筑收益计算公式
        //income = base_income * e_star * e_builiding * e_policy * e_album * e_cityMission (* e_extraBuff还不确定家国之光类buff是单独乘还是算在政策内)
        // var building_id = 300
        // var income = this.getBaseIncome(building_id, 1249) * this.getStarBuff(5) 
        // * this.getBuildingBuff(building_id) 
        // * this.getPolicyBuff(building_id)
        // * this.getAlbumBuff(building_id)
        // * this.getCityMissionBuff(building_id)
        // * this.getExtraBuff(building_id)
        // console.log(utils.numberFormat(income) )

        var icbn = utils.getCombinations(this.data.industry_buildings, 3)
        var bcbn = utils.getCombinations(this.data.business_buildings, 3)
        var rcbn = utils.getCombinations(this.data.residence_buildings, 3)

        var start_time = new Date().getTime()
        this.setData({
            max_progress: utils.combinationCount(10,3) * utils.combinationCount(10, 3) * utils.combinationCount(10, 3),
            computing: true,
        })

        var count = 0
        
        var calc_timer = setInterval(function(){
            console.log("in timer")
            this.setData({
                current_progress: count 
            })
        }, 100);

        for(var ii in icbn){
            for(var ib in bcbn){
                for(var ir in rcbn){
                    var perhaps_cbn = [].concat(icbn[ii], bcbn[ib], rcbn[ir])
                    // console.log(perhaps_cbn)
                    count++;
                }
            }
        } 
        console.log("finish")
        clearInterval(calc_timer)
        this.setData({
            computing: false,
            compute_cost_time:new Date().getTime() - start_time
        })
    }
})