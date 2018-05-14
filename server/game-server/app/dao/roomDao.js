var pomelo = require('pomelo');
var Knex = require('knex');
var Moment = require('moment');

var Utils = require('../../util/utils');
var RetCode = require('../../util/retcode');

var RoomDao = module.exports;

//=============================================================  Get Function  =============================================================
/**
 * 
 * @param {String} invitecode 
 * @param {Function} cb 
 */
RoomDao.findRoomByInviteCode = function (invitecode, cb) {
    //不要超时的房间
    let now = Moment().unix();
    let sql = Knex('room').select('*').from('room').where('invitecode', invitecode).andWhere('timeout', '>', now).toString();
    console.log(sql);
    pomelo.app.get('dbclient').query(sql, function (err, res) {
        if (err) {
            Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
        } else {
            console.log(res);
            Utils.invokeCallback(cb, null, res);
        }
    });
}
//=============================================================  Create Function  =============================================================
/**
 * 向数据库中写入房间信息
 * @param {Object} room 
 * @param {Function} cb 
 */
RoomDao.createRoom = function (room, cb) {
    let roomData = Utils.subObject(room, ['type', 'name', 'invitecode', 'serverid', 'creatorid', 'creatorname', 'timeout', 'createTime']);
    let sql = Knex('room').insert(roomData).into('room').toString();
    console.log(sql);
    pomelo.app.get('dbclient').insert(sql, function (err, res) {
        if (err !== null) {
            Utils.invokeCallback(cb, { code: RetCode.FAIL, msg: err.message }, null);
        } else {
            room.id = res.insertId
            Utils.invokeCallback(cb, null, room);
        }
    });
}
//=============================================================  Update Function  =============================================================
//=============================================================  Check Function  =============================================================