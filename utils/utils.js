// 页面滚动到指定id的组件
const pageScrollToId = function (page, id) {
    const query = wx.createSelectorQuery().in(page);
    query.select(id).boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec((rects) => {
        // 使页面滚动到指定item
        const pos = rects[0].top
        wx.pageScrollTo({
            scrollTop: pos,
            duration: 300
        })
    })
}

//组合数
const combinationCount = function (m, n) {
    return factorial(m, n) / factorial(n, n);
}

//阶乘
const factorial = function (m, n) {
    var result = 1;
    var count = 0;
    for (var i = m; i > 0; i--) {
        if (count == n) {
            break;
        }

        result *= i;
        count++;
    }
    return result;
}

//得到组合结果
const getCombinations = function (array, length) {
    if (length > array.length) {
        length = array.length;
    }

    function fork(i, t) {                   // recursive fn with index & temp array
        if (t.length === length) {          // check temp length
            result.push(t);                 // push collected values
            return;                         // exit function
        }
        if (i === array.length) {           // check if index is out of range
            return;                         // exit function
        }
        fork(i + 1, t.concat([array[i]]));  // call for with a new letter from index
        fork(i + 1, t);                     // call for without a new letter
    }

    var result = [];                        // for keeping the part results
    fork(0, []);                            // start with index zero and empty temp array
    return result;                          // return result
}

const clampNumber = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

const unit = ["", "K", "M", "B", "T", "aa", "bb", "cc", "dd", "ee", "ff", "gg"];
const numberFormat = function (number) {
    var index = 0;
    while (Math.pow(10, index * 3 + 3) < number && index < unit.length - 1) {
        index += 1;
    }
    return (number / Math.pow(10, index * 3)).toFixed(2) + unit[index];
}

module.exports = {
    pageScrollToId: pageScrollToId,
    combinationCount: combinationCount,
    getCombinations: getCombinations,
    clampNumber: clampNumber,
    numberFormat: numberFormat,
}