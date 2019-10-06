var Configs = {
    name:"默认个人配置",
    // {"id":{enabled, starlevel, level}}
    buildings:{},
    // {"id":{level}}
    policies:{},
    // {"buff_type":{value}}
    albums:{},

    city_missions:{
        // {"buff_type":{value}}
        buff:{ },
        // [{"id":value, "value":value}]
        building:[
            { id:0, value:0, index:0},
            { id:0, value:0, index:0},
            { id:0, value:0, index:0},
        ],
    },
    // 家国之光，活动buff等的总和{"buff_type": {value}}
    extra_buff:{},
}

module.exports = {
    Configs : Configs,
}