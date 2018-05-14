var pomelo = require('pomelo');
var Knex = require('knex');
var Moment = require('moment');

var Utils = require('../../util/utils');
var RetCode = require('../../util/retcode');

var TexasRoomDao = module.exports;

//=============================================================  Get Function  =============================================================
//=============================================================  Create Function  =============================================================
TexasRoomDao.createRule = function (room, cb) {
    room.rule.id = room.baseRoom.id;
    room.rule.createTime = Moment().unix();
    let ruleData = Utils.subObject(room.rule, ['id', 'bringIn', 'minBet', 'createTime']);
    let sql = Knex('texasRoom').insert(ruleData).into('texasroom').toString();
    console.log(sql);
    pomelo.app.get('dbclient').insert(sql, function (err, res) {
        if (err !== null) {
            Utils.invokeCallback(cb, { code: RetCode.FAIL, msg: err.message }, null);
        } else {
            Utils.invokeCallback(cb, null, room);
        }
    });
}
//=============================================================  Update Function  =============================================================
//=============================================================  Check Function  =============================================================