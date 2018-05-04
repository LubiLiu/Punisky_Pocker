var async = require('async');
var pomelo = require('pomelo');
var moment = require('moment');
var _ = require('lodash');
var logger = require('pomelo-logger').getLogger(__filename);

var User = require('../../../domain/user');

var validationDao = require('../../../dao/validationDao');
var userDao = require('../../../dao/userDao');

var userManager = require('../../../services/userManager');

var utils = require('../../../util/utils');
var define = require('../../../../../shared/define');

module.exports = function (app) {
	return new Handler(app);
};

var Handler = function (app) {
	this.app = app;
};

Handler.prototype.sendValidateMsg = function (msg, session, next) {
	var lostParams = utils.checkParams(msg, ['phone', 'vtype']);
	if (lostParams.length > 0) {
		next(null, { code: define.INVALIDPARAM, error: utils.joinArray(lostParams, '|') })
		return;
	}
	var phone = msg.phone, vtype = msg.vtype;
	userDao.checkPhoneExist(phone, function (err, count) {
		if (err) {
			next(null, { code: define.FAIL, error: '服务器内部错误' });
			return;
		}
		switch (vtype) {
			case define.ValidationType.Registe:
				if (count > 0) {
					next(null, { code: define.USER.USER_EXISTED, error: '玩家已存在' });
					return;
				}
				break;
			case define.ValidationType.QuickLogin:
				if (count <= 0) {
					next(null, { code: define.USER.USER_NOT_EXISTED, error: '玩家不存在' });
					return;
				}
			default:
				break;
		}
		//可以正常的生成了
		let randomCode = utils.zeroPadding(utils.getRandomInt(0, 1000000), 6);
		validationDao.insertValidation(phone, vtype, randomCode, function (err, validation) {
			if (err) {
				next(null, { code: define.FAIL, error: err });
				return;
			}
			//TODO send msg 暂时没有
			next(null, { code: define.OK, validation: validation });
		})
	});
}

Handler.prototype.registePhone = function (msg, session, next) {
	var lostParams = utils.checkParams(msg, ['phone', 'validation', 'password', 'name']);
	if (lostParams.length > 0) {
		next(null, { code: define.INVALIDPARAM, error: utils.joinArray(lostParams, '|') })
		return;
	}
	var phone = msg.phone, validation = msg.validation, password = msg.password, name = msg.name;
	async.waterfall([
		function (ne) {
			//检查是否有这个手机的账号
			userDao.checkPhoneExist(phone, function (err, count) {
				if (err) {
					logger.error('[register] fail to invoke registePhone for ' + err.stack);
					ne({ code: define.FAIL, error: '服务器内部错误' });
					return;
				}
				if (count > 0) {
					ne({ code: define.USER.USER_EXISTED, error: '玩家已存在' });
					return;
				}
				ne();
			});
		},
		function (ne) {
			//检查是否有这个名字的账号
			userDao.checkNameExist(name, function (err, count) {
				if (err) {
					logger.error('[register] fail to invoke registePhone for ' + err.stack);
					ne({ code: define.FAIL, error: '服务器内部错误' });
					return;
				}
				if (count > 0) {
					ne({ code: define.USER.USER_EXISTED, error: '玩家已存在' });
					return;
				}
				ne();
			});
		},
		function (ne) {
			//检查验证码
			validationDao.getValidation(phone, define.ValidationType.Registe, function (err, validation) {
				if (err) {
					logger.error('[register] fail to invoke registePhone for ' + err.stack);
					ne({ code: define.FAIL, error: '服务器内部错误' });
					return;
				}
				if (validation == null) {
					ne({ code: define.USER.USER_NO_VALIDATION, error: '验证码错误' });
					return;
				}
				var now = moment().unix();
				if (validation.createTime + define.ValidationTimeout < now) {
					ne({ code: define.USER.USER_VALIDATION_TIMEOUT, error: '验证码超时' });
					return;
				}
				if (_.toString(validation.value) != _.toString(validation)) {
					ne({ code: USER_VALIDATION_ERR, error: '验证呀不正确' });
					return;
				}
				//验证成功
				ne();
			});
		},
		function (ne) {
			//可以创建了
			userDao.createUserByPhone(phone, password, name, function (err, user) {
				if (err) {
					logger.error('[register] fail to invoke registePhone for ' + err.stack);
					ne({ code: define.FAIL, error: '服务器内部错误' }, null);
					return;
				}
				ne(null, user);
			})
		}
	], function (err, user) {
		if (err) {
			next(null, err);
			return;
		}
		userManager.addUser(user);
		next(null, { code: define.OK, user: user });
	});
}

Handler.prototype.createPlayer = function (msg, session, next) {
	var uid = session.uid, roleId = msg.roleId, name = msg.name;
	var self = this;

	userDao.getPlayerByName(name, function (err, player) {
		if (player) {
			next(null, { code: consts.MESSAGE.ERR });
			return;
		}

		userDao.createPlayer(uid, name, roleId, function (err, player) {
			if (err) {
				logger.error('[register] fail to invoke createPlayer for ' + err.stack);
				next(null, { code: consts.MESSAGE.ERR, error: err });
				return;
			} else {
				async.parallel([
					function (callback) {
						equipDao.createEquipments(player.id, callback);
					},
					function (callback) {
						bagDao.createBag(player.id, callback);
					},
					function (callback) {
						player.learnSkill(1, callback);
					}],
					function (err, results) {
						if (err) {
							logger.error('learn skill error with player: ' + JSON.stringify(player.strip()) + ' stack: ' + err.stack);
							next(null, { code: consts.MESSAGE.ERR, error: err });
							return;
						}
						afterLogin(self.app, msg, session, { id: uid }, player.strip(), next);
					});
			}
		});
	});
};

var afterLogin = function (app, msg, session, user, player, next) {
	async.waterfall([
		function (cb) {
			session.bind(user.id, cb);
		},
		function (cb) {
			session.set('username', user.name);
			session.set('areaId', player.areaId);
			session.set('serverId', app.get('areaIdMap')[player.areaId]);
			session.set('playername', player.name);
			session.set('playerId', player.id);
			session.on('closed', onUserLeave);
			session.pushAll(cb);
		},
		function (cb) {
			app.rpc.chat.chatRemote.add(session, user.id, player.name, channelUtil.getGlobalChannelName(), cb);
		}
	],
		function (err) {
			if (err) {
				logger.error('fail to select role, ' + err.stack);
				next(null, { code: consts.MESSAGE.ERR });
				return;
			}
			next(null, { code: consts.MESSAGE.RES, user: user, player: player });
		});
};

var onUserLeave = function (session, reason) {
	if (!session || !session.uid) {
		return;
	}

	utils.myPrint('2 ~ OnUserLeave is running ...');
	var rpc = pomelo.app.rpc;
	rpc.area.playerRemote.playerLeave(session, { playerId: session.get('playerId'), areaId: session.get('areaId') }, null);
	rpc.chat.chatRemote.kick(session, session.uid, null);
};
