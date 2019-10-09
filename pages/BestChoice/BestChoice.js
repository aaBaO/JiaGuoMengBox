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
        allBaseIncome:{},
        allPolicyBuff:{},

        computing: false,
        compute_cost_time: 0,
        current_count:0,
        max_count:0,
    },

    timerId:0,
    /**
     * Lifecycle function--Called when page load
     */
    onLoad: function (options) {
        for(var i in FooData.buildings_list){
            var building = FooData.buildings_list[i]
            if(!self_configs.buildings[building.id].enabled){
                continue
            }
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

        //计算所有建筑的基本收益
        this.data.allBaseIncome = this.getAllBaseIncome()
        //获得所有类型的政策buff加成
        this.data.allPolicyBuff = this.getAllPolicyBuff()

        this.setData({
            allBaseIncome: this.data.allBaseIncome,
            allPolicyBuff: this.data.allPolicyBuff,
        })

        console.log("onload")
        this.timerId = this.startTimer()
    },

    //baseincome * star_level
    getAllBaseIncome:function(){
        var result = {}
        for(var id in self_configs.buildings){
            result[id] = 0
            var data = FooData.getBuildingData(id)
            var cfg = self_configs.buildings[id]
            result[id] = (data.income_offset * 0.01) * (FooData.star_offset[cfg.star_level] * 0.01)
        }
        return result
    },

    //获得当前组合中的所有buff加成
    getAllBuffInCombination:function(combination){
        var result = {}
        for(var id in combination){
            const building = combination[id]
            if(building.buff_type){
                for(var index in building.buff_type){
                    const buff_type = building.buff_type[index].bufftype
                    const star_level = self_configs.buildings[building.id].star_level
                    result[buff_type] += building.buff_type[index].value[star_level]
                }
            }
        }
        return result
    },

    //建筑间加成,互相在阵容内才有加成
    getBuildingBuff:function(building, combination, all_buff){
        var result = 100
        for(var i in combination){
            const test = combination[i]
            if(test.benefit_list){
                for(var j in test.benefit_list){
                    if(test.benefit_list[j].building_id == building.id){
                        var offset = self_configs.buildings[building.id].star_level
                        result += test.benefit_list[j].value[offset]
                    }
                }
            }
        }

        for(var buff_type in building.affect_buffs){
            if(buff_type == this.data.filter_buff_type){
                continue;
            }
            result += all_buff[buff_type]
        }
        return result * 0.01 
    },

    getAllPolicyBuff:function(){
        var result = {}
        for(var i in FooData.buff_type){
            var buff = FooData.buff_type[i]
            result[buff.id] = 0
        }
    
        for(var policy_id in self_configs.policies){
            var policy = FooData.getPolicyData(policy_id)
            var level = self_configs.policies[policy_id].level
            result[policy.buff_type] += policy.enhance_value[level]
        }

        for(var buff_type in self_configs.extra_buff){
            result[buff_type] += self_configs.extra_buff[buff_type].value
        }
        return result
    },

    getPolicyBuff:function(building){
        var result = 100

        for(var buff_type in building.affect_buffs){
            if(buff_type == this.data.filter_buff_type){
                continue;
            }
            result += this.allPolicyBuff[buff_type]
        }

        return result * 0.01
    },

    getAlbumBuff:function(building){
        var result = 100

        for(var buff_type in building.affect_buffs){
            if(buff_type == this.data.filter_buff_type){
                continue;
            }
            result += self_configs.albums[buff_type].value
        }

        return result * 0.01
    },

    getCityMissionBuff:function(building){
        var result = 100
        var city_building_enhance = self_configs.city_missions.building

        for(var buff_type in building.affect_buffs){
            if(buff_type == this.data.filter_buff_type){
                continue;
            }
            result += self_configs.city_missions.buff[buff_type].value
        }

        for(var i in city_building_enhance){
            if(city_building_enhance[i].id == building.id){
                result += city_building_enhance[i].value
            }
        }
        return result * 0.01
    },

    getOnlineOfflineFactor:function(online){
        return online ? 1 : 0.5
    },

    //单建筑收益
    //income = base_income * e_star * e_builiding * e_policy * e_album * e_cityMission 
    getBuildingIncome:function(building_data, building_level, combination, all_buff){
        return this.getOnlineOfflineFactor(this.data.online_flag)
        * this.data.allBaseIncome[building_data.id]
        * (FooData.level_income[building_level] * 0.01)
        * this.getBuildingBuff(building_data, combination, all_buff) 
        * this.getPolicyBuff(building_data)
        * this.getAlbumBuff(building_data)
        * this.getCityMissionBuff(building_data)
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

        console.log("hide")
    },

    /**
     * Lifecycle function--Called when page unload
     */
    onUnload: function () {
        console.log("unload")
        clearInterval(this.timerId)
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

    startTimer:function(){
        var page = this
        return setInterval(()=>{
            if(page.data.computing){
                console.log("computing")
                page.setData({
                    current_count:page.data.current_count,
                    max_count:page.data.max_count
                }) 
            }
        }, 100)
    },

    onClick_StartCalc:function(){
        var icbn = utils.getCombinations(this.data.industry_buildings, 3)
        var bcbn = utils.getCombinations(this.data.business_buildings, 3)
        var rcbn = utils.getCombinations(this.data.residence_buildings, 3)

        this.data.max_count = utils.combinationCount(this.data.industry_buildings.length, 3) 
        * utils.combinationCount(this.data.business_buildings.length, 3) 
        * utils.combinationCount(this.data.residence_buildings.length, 3)
        this.data.current_count = 0
        
        var start_time = new Date().getTime()
        this.setData({
            computing: true,
            current_count: this.data.current_count,
            max_count: this.data.max_count,
        })

        //遍历所有组合
        var mostIncome = 0
        var resultCbn = []
        for(var ii in icbn){
            for(var ib in bcbn){
                for(var ir in rcbn){
                    this.data.current_count++
                    var perhaps_cbn = [].concat(icbn[ii], bcbn[ib], rcbn[ir])
                    var all_buff_in_cbn = this.getAllBuffInCombination(perhaps_cbn)
                    var tmpIncome = 0
                    for(var ip in perhaps_cbn){
                        var level = self_configs.buildings[perhaps_cbn[ip].id].level
                        tmpIncome += this.getBuildingIncome(perhaps_cbn[ip], level, perhaps_cbn, all_buff_in_cbn)
                    } 
                    if(tmpIncome > mostIncome){
                        mostIncome = tmpIncome
                        resultCbn = perhaps_cbn
                    }
                }
            }
        } 
        // for(var ir in resultCbn){
        //     var item = resultCbn[ir]
        //     var star_level = self_configs.buildings[item.id].star_level
        //     var level = self_configs.buildings[item.id].level
        //     item.income = utils.numberFormat(this.getBuildingIncome(item.id, star_level, level, resultCbn)) 
        //     //升级消耗比(ratio of income increase to upgrade cost)
        //     item.ric = this.getBuildingRICArray(10, item.id, star_level, level, resultCbn)
        // }
        console.log(resultCbn)
        console.log(utils.numberFormat(mostIncome))
        this.setData({
            computing: false,
            current_count: this.data.current_count,
            compute_cost_time:new Date().getTime() - start_time
        })
    }
})