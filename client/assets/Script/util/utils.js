var Code = require('./retcode');

var utils = module.exports;

// control variable of func "myPrint"
var isPrintFlag = false;
// var isPrintFlag = true;

/**
 * Check and invoke callback function
 */
utils.invokeCallback = function (cb) {
    if (!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

/**
 * clone an object
 */
utils.clone = function (origin) {
    if (!origin) {
        return;
    }

    var obj = {};
    for (var f in origin) {
        if (origin.hasOwnProperty(f)) {
            obj[f] = origin[f];
        }
    }
    return obj;
};

/**
 * 一个object的key的数量
 * @param {object} obj 
 */
utils.size = function (obj) {
    if (!obj) {
        return 0;
    }

    var size = 0;
    for (var f in obj) {
        if (obj.hasOwnProperty(f)) {
            size++;
        }
    }

    return size;
};

// print the file name and the line number ~ begin
function getStack() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
        return stack;
    };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
}

function getFileName(stack) {
    return stack[1].getFileName();
}

function getLineNumber(stack) {
    return stack[1].getLineNumber();
}

/** 
 * 打印日志
 * @function 
 * @param {number} min
 * @param {number} max
 */
utils.myPrint = function () {
    if (isPrintFlag) {
        var len = arguments.length;
        if (len <= 0) {
            return;
        }
        var stack = getStack();
        var aimStr = '\'' + getFileName(stack) + '\' @' + getLineNumber(stack) + ' :\n';
        for (var i = 0; i < len; ++i) {
            aimStr += arguments[i] + ' ';
        }
        console.log('\n' + aimStr);
    }
};

/** 
 * 随机一个范围内的数字
 * @function 
 * @param {number} min
 * @param {number} max
 */
utils.getRandomInt = function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};
/**
 * 数字补零
 * @function zeroPadding
 * @param {number} num 输入数字
 * @param {number} n 需要补足到的位数
 */
utils.zeroPadding = function (tbl) {
    return function (num, n) {
        return (0 >= (n = n - num.toString().length)) ? num.toString() : (tbl[n] || (tbl[n] = Array(n + 1).join('0'))) + num.toString();
    };
}([]);
/** 
 * 随机一个长度的字符串
 * @function 
 * @param {number} len
 */
utils.getRandomString = function (len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
};
/**
 * 检查必要的参数
 * @function
 * @param {object} obj
 * @param {Array} params
 * @returns {Array} lostParams
 */
utils.checkParams = function (obj, params) {
    var lostParams = [];
    for (var i = 0; i < params.length; i++) {
        if (obj[params[i]] == null) {
            lostParams.push(params[i]);
        }
    }
    return lostParams;
}
/**
 * 将数据转换成string
 * @function
 * @param {Array} params
 * @param {String}  delimiter
 * @returns {String} ret
 */
utils.joinArray = function (params, delimiter) {
    var ret = '';
    delimiter = delimiter | ',';
    for (var i = 0; i < params.length; i++) {
        ret = ret + params[i] + delimiter;
    }
    return ret;
}

/**
 * 通用处理消息的接口
 * @param {Object} msg 
 */
utils.handleResponse = function (msg) {
    if (msg && msg.code == Code.INVALID_CONNECT) {
        //无效链接了
        //TODO 弹个框？回到主界面？
    }
}