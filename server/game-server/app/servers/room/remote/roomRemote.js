var Async = require('async');
var Moment = require('moment');
var _ = require('lodash');

var Define = require('../../../../util/define');
var RetCode = require('../../../../util/retcode');
var Util = require('../../../../util/utils');

module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

/**
 * 创建房间
 * @param {Object} user 
 * @param {Number} roomtype 
 * @param {String} name 
 * @param {Object} rule 
 * @param {Number} duration 
 * @param {Function} cb 
 */
Handler.prototype.createRoom = function (user, roomtype, name, rule, duration, cb) {
    //检查参数
    if (!_.isObject(user)) {
        return Util.invokeCallback(cb, { code: RetCode.INVALID_PARAM, msg: 'lost params: user ' });
    }
    if (!_.isNumber(roomtype)) {
        return Util.invokeCallback(cb, { code: RetCode.INVALID_PARAM, msg: 'lost params: roomtype ' });
    }
    if (!_.isString(name)) {
        return Util.invokeCallback(cb, { code: RetCode.INVALID_PARAM, msg: 'lost params: name ' });
    }
    if (!_.isObject(rule)) {
        return Util.invokeCallback(cb, { code: RetCode.INVALID_PARAM, msg: 'lost params: rule ' });
    }
    if (!_.isNumber(duration)) {
        return Util.invokeCallback(cb, { code: RetCode.INVALID_PARAM, msg: 'lost params: duration ' });
    }
    //
}