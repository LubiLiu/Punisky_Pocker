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
    //由服务器远端调用过来，相信服务器的参数都是对的
    //
    let roomMgr = this.app.components[Define.COMPONENT_KEY.ROOM_MANAGER];
    if (null == roomMgr) {
        return Util.invokeCallback(cb, { code: RetCode.ROOM.NO_USABLEROOMMGR, msg: '没有可用的房间管理器' });
    }
    roomMgr.createRoom(user, roomtype, name, rule, duration, function (err, result)){
        if (err) {
            return Util.invokeCallback(cb, err);
        } else {
            return Util.invokeCallback(cb, { code: RetCode.OK, msg: result });
        }
    }
}