var Async = require('async');

var Util = require('../../../../util/utils');
var RetCode = require('../../../../util/retcode');

var UserDao = require('../../../dao/userDao');
var RoomDao = require('../../../dao/roomDao');

module.exports = function (app) {
	return new Handler(app);
};

var Handler = function (app) {
	this.app = app;
};


/**
 * 创建一个房间
 * @param {Object} msg 
 * @param {Object} session 
 * @param {Function} next 
 */
Handler.prototype.createRoom = function (msg, session, next) {
	if (session.user == null) {
		//回去登录
		next(null, { code: RetCode.USER.NEED_LOGIN, msg: '请重新登录' });
		return;
	}
	let lostParams = Util.checkParams(msg, ['roomtype', 'name', 'rule', 'duration']);
	if (lostParams.length > 0) {
		next(null, { code: RetCode.INVALID_PARAM, msg: 'lost params : ' + Util.joinArray(lostParams) });
		return;
	}
	Async.waterfall([
		function (anext) {
			//TODO 要做判断 钱够不够啦 vip够不够啦 
			anext(null);
		},
		function (anext) {
			//创建
			app.rpc.game.hallRemote.createRoom(session.user.id, session.user, msg.roomtype, msg.name, msg.rule, msg.duration, function (result) {
				if (result.code == RetCode.OK) {
					// session.set
				}
				anext(null, result);
			});
		}
	], function (err, result) {
		if (err) {
			next(null, err);
		} else {
			next(null, result);
		}
	});
};

/**
 * 通过邀请码查找一个房间 可能会找到多个哦
 * @param {Object} msg 
 * @param {Object} session 
 * @param {Function} next 
 */
Handler.prototype.findRoomByInvite = function (msg, session, next) {
	if (session.user == null) {
		//回去登录
		next(null, { code: RetCode.USER.NEED_LOGIN, msg: '请重新登录' });
		return;
	}
	let lostParams = Util.checkParams(msg, ['invitecode']);
	if (lostParams.length > 0) {
		next(null, { code: RetCode.INVALID_PARAM, msg: 'lost params : ' + Util.joinArray(lostParams) });
		return;
	}
	Async.waterfall([
		function (anext) {
			RoomDao.findRoomByInviteCode(msg.invitecode, function (err, results) {
				anext(err, results);
			});
		},
		function (results, anext) {
			console.log(results);
			anext(null, results);
		}
	], function (err, result) {
		if (err) {
			next(null, err);
		} else {
			if (retMsg != null) {
				next(null, retMsg);
			} else {
				//可以创建
				next(null, { code: RetCode.OK, msg: result });
			}
		}
	});
}

/**
 * 进入一个房间 通过房间的创建者会route到指定的gameserver
 * @param {Object} msg 
 * @param {Object} session 
 * @param {Object} next 
 */
Handler.prototype.enterRoom = function (msg, session, next) {
	if (session.user == null) {
		//回去登录
		next(null, { code: RetCode.USER.NEED_LOGIN, msg: '请重新登录' });
		return;
	}
}
