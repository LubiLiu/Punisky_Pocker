/**
 *Module dependencies
 */
var Async = require('async');
var logger = require('pomelo-logger').getLogger(__filename);

var RoomDao = require('../dao/roomDao');
var TexasRoomDao = require('../dao/texasRoomDao');
var Room = require('./room');
var Util = require('../../util/utils');
/**
 * Initialize a new 'Room' with the given 'opts'.
 * 这个类包含一个房间的基本数据 其他类型的房间都包含这个数据
 *
 * @param {Object} opts
 * @api public
 */

var TexasRoom = function (opts) {
    this.baseRoom = new Room(opts);
    this.rule = opts.rule;
    this.gamers = [];
    this.table = null;
    this.seats = [];
};


TexasRoom.createTexasRoom = function (opts, cb) {
    let room = new TexasRoom(opts);
    Async.waterfall([
        function (anext) {
            //创建基本房间信息
            RoomDao.createRoom(room.baseRoom, function (err, roominfo) {
                if (err !== null) {
                    anext(err);
                } else {
                    room.baseRoom = roominfo;
                    anext(null);
                }
            });
        },
        function (anext) {
            //创建其他规则
            TexasRoomDao.createRule(room, function (err, roominfo) {
                if (err !== null) {
                    anext(err);
                } else {
                    room = roominfo;
                    anext(null);
                }
            });
            anext();
        }
    ], function (err) {
        Util.invokeCallback(cb, err, room);
    });
}

module.exports = TexasRoom;