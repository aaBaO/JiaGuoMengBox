const utils = require('./utils.js')
const Debug = true

var FooData, self_configs = 'undefined'
var industry_buildings, business_buildings, residence_buildings
var allBaseIncome, allPolicyBuff
//默认过滤离线buff
var filter_buff_type = 3
var online_flag = 1
var current_count = 0
var max_count = 0

worker.onMessage(function (res) {
    if (Debug) console.log(res)

    if (res.msg === "getBestCombination") {
        getBestCombination(res.data)
    } else if (res.msg === "setData") {
        setData(res.data)
    }
})

const getBuildingData = function (building_id) {
    for (var i in FooData.buildings_list) {
        if (FooData.buildings_list[i].id == building_id) {
            return FooData.buildings_list[i];
        }
    }
    console.log("错误的建筑id");
    return null;
}

const getPolicyData = function (policy_id) {
    for (var stage in FooData.policy_list) {
        var policy_stage = FooData.policy_list[stage]
        for (var i in policy_stage) {
            if (policy_stage[i].id == policy_id) {
                return policy_stage[i]
            }
        }
    }
    console.log("错误的政策id");
    return null;
}

//计算所有建筑的基本收益
//baseincome * star_level
const getAllBaseIncome = function () {
    var result = {}
    for (var id in self_configs.buildings) {
        result[id] = 0
        var data = getBuildingData(id)
        var cfg = self_configs.buildings[id]
        result[id] = (data.income_offset * 0.01) * (FooData.star_offset[cfg.star_level] * 0.01)
    }
    return result
}

//获得当前组合中的所有buff加成
const getAllBuffInCombination = function (combination) {
    var result = {}
    for (var id in combination) {
        const building = combination[id]
        if (building.buff_type) {
            for (var index in building.buff_type) {
                const buff_type = building.buff_type[index].bufftype
                const star_level = self_configs.buildings[building.id].star_level
                result[buff_type] = (result[buff_type] || 0) + building.buff_type[index].value[star_level]
            }
        }
    }
    if (Debug) console.log("当前组合中的buff:",result)
    return result
}

//建筑间加成,互相在阵容内才有加成
const getBuildingBuff = function (building, combination, all_buff) {
    var result = 100
    for (var i in combination) {
        const test = combination[i]
        if (test.benefit_list) {
            for (var j in test.benefit_list) {
                if (test.benefit_list[j].building_id == building.id) {
                    var offset = self_configs.buildings[test.id].star_level
                    result += test.benefit_list[j].value[offset]
                }
            }
        }
    }
    console.log("建筑与阵容间建筑加成:",building, result)

    const building_type = FooData.building_type[building.type - 1]
    // console.log("受哪些buff加成:", building_type.affect_buffs)
    for (var i in building_type.affect_buffs) {
        var buff_type = building_type.affect_buffs[i]
        if (buff_type == filter_buff_type) {
            continue;
        }
        result += all_buff[buff_type] || 0
    }
    // console.log("阵容间buff加成:",building, result)
    return result * 0.01
}

//获得所有类型的政策buff加成
const getAllPolicyBuff = function () {
    var result = {}
    for (var i in FooData.buff_type) {
        var buff = FooData.buff_type[i]
        result[buff.id] = 0
    }

    for (var policy_id in self_configs.policies) {
        var policy = getPolicyData(policy_id)
        var level = self_configs.policies[policy_id].level
        result[policy.buff_type] += policy.enhance_value[level]
    }

    for (var buff_type in self_configs.extra_buff) {
        result[buff_type] += self_configs.extra_buff[buff_type].value
    }
    if (Debug) console.log("所有政策加成:",result)
    return result
}

const getPolicyBuff = function (building) {
    var result = 100

    const building_type = FooData.building_type[building.type-1]
    for (var i in building_type.affect_buffs) {
        var buff_type = building_type.affect_buffs[i]
        if (buff_type == filter_buff_type) {
            continue;
        }
        result += allPolicyBuff[buff_type] || 0
    }

    return result * 0.01
}

const getAlbumBuff = function (building) {
    var result = 100

    const building_type = FooData.building_type[building.type-1]
    for (var i in building_type.affect_buffs) {
        var buff_type = building_type.affect_buffs[i]
        if (buff_type == filter_buff_type) {
            continue;
        }
        result += self_configs.albums[buff_type].value || 0
    }

    return result * 0.01
}

const getCityMissionBuff = function (building, ) {
    var result = 100
    var city_building_enhance = self_configs.city_missions.building

    const building_type = FooData.building_type[building.type-1]
    for (var i in building_type.affect_buffs) {
        var buff_type = building_type.affect_buffs[i]
        if (buff_type == filter_buff_type) {
            continue;
        }
        result += self_configs.city_missions.buff[buff_type].value || 0
    }

    for (var i in city_building_enhance) {
        if (city_building_enhance[i].id == building.id) {
            result += city_building_enhance[i].value
        }
    }

    return result * 0.01
}

const getOnlineOfflineFactor = function (online) {
    return online ? 1 : 0.5
}

//单建筑收益
//income = base_income * e_star * e_builiding * e_policy * e_album * e_cityMission 
const getBuildingIncome = function (building_data, building_level, combination, all_buff) {
    return getOnlineOfflineFactor(online_flag)
        * allBaseIncome[building_data.id]
        * FooData.level_income[building_level]
        * getBuildingBuff(building_data, combination, all_buff)
        * getPolicyBuff(building_data)
        * getAlbumBuff(building_data)
        * getCityMissionBuff(building_data)
}

//获取单个建筑一定范围内的升级消耗比例
//升级消耗比(ratio of income increase to upgrade cost)
const getBuildingRICArray = function (range, building_id, building_star_level, building_level, combination) {
    var result = []
    var rare = getBuildingData(building_id).rare
    for (var i = 0; i < range; i++) {
        var ia = this.getBuildingIncome(building_id, building_star_level, building_level + i + 1, combination)
        var ib = this.getBuildingIncome(building_id, building_star_level, building_level + i, combination)
        var cost = FooData.getUpgradeCost(building_id, rare)
        result.push((ia - ib) / cost)
    }
    return result
}

// data:{
//     db  数据库
//     self_configs 个人配置
// }
const setData = function (data) {
    FooData = data.db
    self_configs = data.self_configs
    getBuildingList()
    allBaseIncome = getAllBaseIncome()
    allPolicyBuff = getAllPolicyBuff()
}

//获得建筑列表
const getBuildingList = function () {
    industry_buildings = []
    business_buildings = []
    residence_buildings = []
    for (var i in FooData.buildings_list) {
        var building = FooData.buildings_list[i]
        if (!self_configs.buildings[building.id].enabled) {
            continue
        }
        if (building.type == 1) {
            industry_buildings.push(building)
        }
        if (building.type == 2) {
            business_buildings.push(building)
        }
        if (building.type == 3) {
            residence_buildings.push(building)
        }
    }
}

// data:{
//     online_flag
// }
const getBestCombination = function (data) {
    online_flag = data.online_flag
    filter_buff_type = online_flag? 3 : 2
    var icbn = utils.getCombinations(industry_buildings, 3)
    var bcbn = utils.getCombinations(business_buildings, 3)
    var rcbn = utils.getCombinations(residence_buildings, 3)

    //当前尝试数量
    current_count = 0
    max_count = icbn.length * bcbn.length * rcbn.length
    worker.postMessage({
        msg: "returnComputProgress",
        data: {
            current_count: current_count,
            max_count: max_count
        },
    })

    var start_time = new Date().getTime()
    //遍历所有组合
    var mostIncome = 0
    var resultCbn = []
    //发送进度的计数
    var sendProgressIndex = 0
    const sendProgressInterval = 100
    for (var ii in icbn) {
        for (var ib in bcbn) {
            for (var ir in rcbn) {
                current_count++
                var perhaps_cbn = [].concat(icbn[ii], bcbn[ib], rcbn[ir])
                var all_buff_in_cbn = getAllBuffInCombination(perhaps_cbn)
                var tmpIncome = 0
                for (var ip in perhaps_cbn) {
                    var level = self_configs.buildings[perhaps_cbn[ip].id].level
                    var income = getBuildingIncome(perhaps_cbn[ip], level, perhaps_cbn, all_buff_in_cbn)
                    tmpIncome += income 
                }
                if (tmpIncome > mostIncome) {
                    mostIncome = tmpIncome
                    resultCbn = perhaps_cbn
                }

                sendProgressIndex++
                if(sendProgressIndex > sendProgressInterval || current_count >= max_count){
                    sendProgressIndex = 0
                    worker.postMessage({
                        msg: "returnComputProgress",
                        data: {
                            current_count: current_count,
                            max_count: max_count
                        },
                    })
                }
            }
        }
    }

    var resultdata = {
        // 最大收入/秒
        mostIncome: utils.numberFormat(mostIncome),
        // 最佳组合
        resultCbn: resultCbn,
        // 计算消耗时间
        cost_time: new Date().getTime() - start_time,
        // 所有建筑基本收入
        allBaseIncome: allBaseIncome,
        // 所有建筑buff加成
        allPolicyBuff: allPolicyBuff,
    }

    if (Debug) console.log(resultdata)
    // return result
    worker.postMessage({
        msg: "returnBestCombination",
        data: resultdata,
    })
}


const getRic = function (data) {
    for (var ir in resultCbn) {
        var item = resultCbn[ir]
        var star_level = self_configs.buildings[item.id].star_level
        var level = self_configs.buildings[item.id].level
        item.income = utils.numberFormat(this.getBuildingIncome(item.id, star_level, level, resultCbn))
        //升级消耗比(ratio of income increase to upgrade cost)
        item.ric = this.getBuildingRICArray(10, item.id, star_level, level, resultCbn)
    }
}
