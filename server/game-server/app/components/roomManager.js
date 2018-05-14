var Moment = require('moment');

var RetCode = require('../../util/retcode');
var Define = require('../../util/define');
var Util = require('../../util/utils');

var TexasRoom = require('../domain/texasRoom');

module.exports = function (app, opts) {
    return new RoomManager(app, opts);
};
var RoomManager = function (app, opts) {
    this.lastTick = Moment().unix();

    //data
    this.rooms = {};
};

RoomManager.prototype.name = Define.COMPONENT_KEY.ROOM_MANAGER;

RoomManager.prototype.start = function (cb) {
    console.log('Hello World Start');
    var self = this;
    //开始tick
    this.timerId = setInterval(function () {
        this.function();
    }.bind(this), this.interval);
    process.nextTick(cb);
}

RoomManager.prototype.afterStart = function (cb) {
    process.nextTick(cb);
}

RoomManager.prototype.stop = function (force, cb) {
    console.log('Hello World stop');
    if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
    }
    process.nextTick(cb);
}


RoomManager.prototype.update = function () {
    let now = Moment().unix();
    for (let key in this.rooms) {
        let room = this.rooms[key];
        Util.invokeCallback(room.update, this.lastTick, now);
    }
    this.lastTick = now;
}
//==========================================================成员函数=============================================================
/**
 * 创建房间
 * @param {Object} user 
 * @param {Number} roomtype 
 * @param {String} name 
 * @param {Object} rule 
 * @param {Number} duration 
 * @param {Function} cb 
 */
RoomManager.prototype.createRoom = function (user, roomtype, name, rule, duration, cb) {
    let opts = {};
    opts.type = roomtype;
    opts.name = name;
    opts.invitecode = Util.zeroPadding(Util.getRandomInt(0, Math.pow(10, Define.CONST_DEFINE.INVITE_SIZE)), Define.CONST_DEFINE.INVITE_SIZE);
    opts.serverid = this.app.getServerId();
    opts.creatorid = user.id;
    opts.creatorname = user.name;
    opts.timeout = Moment().unix() + duration;
    opts.createTime = Moment().unix();
    opts.rule = rule;
    //参数判断由外部完成
    switch (roomtype) {
        case Define.ROOM_TYPE.TEXAS:
            {
                TexasRoom.createTexasRoom(opts, function (err, room) {
                    if (err !== null) {
                        Util.invokeCallback(cb, err);
                    } else {
                        this.rooms[room.baseRoom.id] = room;
                        Util.invokeCallback(cb, null, room);
                    }
                }.bind(this));
            }
            break;
        default:
            {
                Util.invokeCallback(cb, { code: RetCode.ROOM.NOSUCH_ROOMTYPE, msg: '没有这个房间类型哦' }, null);
            }
            break;
    }
}

/**
 * 加入一个房间
 * @param {Object} user 
 * @param {Number} invitecode 
 * @param {Function} cb 
 */
RoomManager.prototype.enterRoom = function (user, invitecode, cb) {

}
