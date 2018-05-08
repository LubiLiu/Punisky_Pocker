var Async = require('async');

var RetCode = require('../../../../util/retcode');

var UserDao = require('../../../dao/userDao');

module.exports = function (app) {
	return new Handler(app);
};

var Handler = function (app) {
	this.app = app;
};

/**
 * 新客户端连接第一步，给session赋值user,没有user后面的请求都无效
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next step callback
 * @return {Void}
 */
Handler.prototype.entry = function (msg, session, next) {
	let lostParams = Util.checkParams(msg, ['uid', 'token']);
	if (lostParams.length > 0) {
		next(null, { code: RetCode.INVALID_PARAM, msg: 'lost params : ' + Util.joinArray(lostParams) });
		return;
	}
	let retMsg = null;
	Async.waterfall([
		function (anext) {
			//加载出这个玩家看看
			UserDao.getUserById(msg.uid, function (err, user) {
				if (err != null) {
					return anext(err);
				}
				if (user == null) {
					retMsg = { code: RetCode.USER.USER_NOT_EXIST, msg: '该用户不存在 : ' + msg.uid };
				}
				//看看token对不对吧
				if (user.token != msg.token) {
					retMsg = { code: RetCode.USER.TOKEN_ERROR, msg: 'Token 错误 : ' + msg.token };
				}
				anext(null, user);
			})
		},
		function (user, anext) {
			if (retMsg != null) {
				return anext(null, user);
			}
			//都对了，那就个你连接。
			session.user = user;
		},
	], function (err, result) {
		if (err) {
			next(null, err);
		} else {
			if (retMsg != null) {
				next(null, retMsg);
			} else {
				next(null, { code: RetCode.OK, msg: 'entry success' });
			}
		}
	});
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
	let retMsg = null;
	Async.waterfall([
		function (anext) {
			//TODO 要做判断 钱够不够啦 vip够不够啦 
			anext(null);
		},
	], function (err, result) {
		if (err) {
			next(null, err);
		} else {
			if (retMsg != null) {
				next(null, retMsg);
			} else {
				//可以创建
				next(null, { code: RetCode.OK, msg: 'entry success' });
			}
		}
	});
};
