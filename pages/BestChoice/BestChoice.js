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
    },

    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        for(var i in FooData.buildings_list){
            var building = FooData.buildings_list[i]
            // if(!self_configs.buildings[building.id].enabled){
            //     continue
            // }
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

    getOnlineOfflineFactor:function(online){
        return online ? 1 : 0.5
    },

    //单建筑收益
    //income = base_income * e_star * e_builiding * e_policy * e_album * e_cityMission 
    getBuildingIncome:function(building_id, building_star_level, building_level, combination){
        return this.getBaseIncome(building_id, building_level)
        * this.getStarBuff(building_star_level) 
        * this.getBuildingBuff(building_id, combination) 
        * this.getPolicyBuff(building_id)
        * this.getAlbumBuff(building_id)
        * this.getCityMissionBuff(building_id)
        * this.getExtraBuff(building_id)
    },

    //获取单个建筑一定范围内的升级消耗比例
    //升级消耗比(ratio of income increase to upgrade cost)
    getBuildingRICArray:function(range, building_id, building_star_level, building_level, combination){
        var result = []
        var rare = FooData.getBuildingData(building_id).rare
        for(var i = 0; i < range; i++){
            var ia = this.getBuildingIncome(building_id, building_star_level, building_level+i+1, combination)
            var ib = this.getBuildingIncome(building_id, building_star_level, building_level+i, combination)
            var cost = FooData.getUpgradeCost(building_id, rare)
            result.push((ia-ib)/cost)
        }
        return result
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
        var icbn = utils.getCombinations(this.data.industry_buildings, 3)
        var bcbn = utils.getCombinations(this.data.business_buildings, 3)
        var rcbn = utils.getCombinations(this.data.residence_buildings, 3)

        console.log(utils.combinationCount(this.data.industry_buildings.length, 3) * utils.combinationCount(this.data.business_buildings.length, 3) * utils.combinationCount(this.data.residence_buildings.length, 3))
        var start_time = new Date().getTime()
        this.setData({
            computing: true,
        })

        //计算当前配置在线最大收益
        var mostIncome = 0
        var resultCbn = []
        for(var ii in icbn){
            for(var ib in bcbn){
                for(var ir in rcbn){
                    var perhaps_cbn = [].concat(icbn[ii], bcbn[ib], rcbn[ir])
                    var tmpIncome = 0
                    for(var ip in perhaps_cbn){
                        var level = self_configs.buildings[perhaps_cbn[ip].id].level
                        var star_level = self_configs.buildings[perhaps_cbn[ip].id].star_level
                        tmpIncome += this.getBuildingIncome(perhaps_cbn[ip].id, star_level, level, perhaps_cbn)
                    } 
                    if(tmpIncome > mostIncome){
                        mostIncome = tmpIncome
                        resultCbn = perhaps_cbn
                    }
                }
            }
        } 
        for(var ir in resultCbn){
            var item = resultCbn[ir]
            var star_level = self_configs.buildings[item.id].star_level
            var level = self_configs.buildings[item.id].level
            item.income = utils.numberFormat(this.getBuildingIncome(item.id, star_level, level, resultCbn)) 
            //升级消耗比(ratio of income increase to upgrade cost)
            item.ric = this.getBuildingRICArray(10, item.id, star_level, level, resultCbn)
        }
        console.log(resultCbn)
        console.log(utils.numberFormat(mostIncome))
        console.log("finish")
        this.setData({
            computing: false,
            compute_cost_time:new Date().getTime() - start_time
        })
    }
})