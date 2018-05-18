var Async = require('async');

var Util = require('../../../../util/utils');
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
Handler.prototype.enterGame = function (msg, session, next) {
	let lostParams = Util.checkParams(msg, ['uid', 'token']);
	if (lostParams.length > 0) {
		next(null, { code: RetCode.INVALID_PARAM, msg: 'lost params : ' + Util.joinArray(lostParams) });
		return;
	}
	let retMsg = null, self = this;
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
			session.bind(user.id);
			session.set('user', user);
			session.on('closed', onUserLeave.bind(null, self.app));
			session.pushAll(anext);
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

var onUserLeave = function (app, session, reason) {
	if (!session || !session.uid) {
		return;
	}
	//通过rpc通知后端服务器玩家要下线了

}