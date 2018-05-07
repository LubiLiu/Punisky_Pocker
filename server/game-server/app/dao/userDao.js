var Logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var Async = require('async');
var Knex = require('knex');
var Moment = require('moment');

var User = require('../domain/user');
var Utils = require('../../util/utils');
var RetCode = require('../../util/retcode');

var UserDao = module.exports;

//=============================================================  Get Function  =============================================================
/**
 * 做登录用，就把其他信息也都加载出来了
 * Get an user by userId
 * @param {Number} uid User Id.
 * @param {function} cb Callback function.
 */
UserDao.getUserById = function (uid, cb) {
	let sql = Knex('user').select('*')
		.from('User')
		.where('id', uid).toString();
	console.log(sql);
	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
		} else if (!res || res.length <= 0) {
			Utils.invokeCallback(cb, null, null);
		} else {
			var user = new User(res[0]);
			UserDao.getUserOtherInfo(user, function (err, results) {
				if (err) {
					Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
				} else {
					var parts = results[0];
					for (var i = 0; i < parts.length; i++) {
						user.setThirdPart(parts[i].method, parts[i].openid);
					}
					var currencys = results[1];
					for (var i = 0; i < currencys.length; i++) {
						user.setCurrency(currencys[i].type, currencys[i].value);
					}
				}
				Utils.invokeCallback(cb, null, user);
			});
		}
	});
};


/**
 * 做登录用，只要把用户信息加载出来就好了
 * Get an user by phone
 * @param {String} phone phone
 * @param {function} cb Callback function.
 */
UserDao.getUserByPhone = function (phone, cb) {
	let sql = Knex('user').select('*')
		.from('User')
		.where('phone', phone).toString();
	console.log(sql);
	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
		} else if (!res || res.length <= 0) {
			Utils.invokeCallback(cb, null, null);
		} else {
			var user = new User(res[0]);
			Utils.invokeCallback(cb, null, user);
		}
	});
};

/**
 * get user by Name
 * @param {String} name User name
 * @param {function} cb Callback function
 */
UserDao.getUserByName = function (name, cb) {
	let sql = Knex('user').select('*')
		.from('User')
		.where('name', name).toString();

	console.log(sql);
	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
		} else if (!res || res.length <= 0) {
			Utils.invokeCallback(cb, null, null);
		} else {
			var user = new User(res[0]);
			UserDao.getUserOtherInfo(user, function (err, results) {
				if (err) {
					Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
				} else {
					var parts = results[0];
					for (var i = 0; i < parts.length; i++) {
						user.setThirdPart(parts[i].method, parts[i].openid);
					}
					var currencys = results[1];
					for (var i = 0; i < currencys.length; i++) {
						user.setCurrency(currencys[i].type, currencys[i].value);
					}
				}
				Utils.invokeCallback(cb, null, user);
			});
		}
	});
};

/**
 * get user by thirdpart info
 * @param {int} method
 * @param {String} openid
 * @param {function} cb
 */
UserDao.getUserByThirdPart = function (method, openid, cb) {
	let sql = Knex('user').select('*')
		.from('ThirdPartUser')
		.where('method', method)
		.andWhere('openid', openid).toString();
	console.log(sql);
	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
		} else if (!res || res.length <= 0) {
			Utils.invokeCallback(cb, null, null);
		} else {
			var part = res[0];
			UserDao.getUserById(part.userid, function (err, user) {
				if (err !== null) {
					Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
				} else {
					Utils.invokeCallback(cb, null, user);
				}
			});
		}
	});
}


/**
 * get thirdPart by id
 * @param {String} uid User id
 * @param {function} cb Callback function
 */
UserDao.getThirdPartById = function (uid, cb) {
	let sql = Knex('user').select('*')
		.from('ThirdPartUser')
		.where('userid', uid).toString();

	console.log(sql);
	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
		} else {
			Utils.invokeCallback(cb, null, res);
		}
	});
};

/**
 * get currency by id
 * @param {String} uid User id
 * @param {function} cb Callback function
 */
UserDao.getCurrencyById = function (uid, cb) {
	let sql = Knex('user').select('*')
		.from('Currency')
		.where('userid', uid).toString();

	console.log(sql);
	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
		} else {
			Utils.invokeCallback(cb, null, res);
		}
	});
};

/**
 * Get all the information of a player, include equipments, bag, skills, tasks.
 * @param {String} playerId
 * @param {function} cb
 */

UserDao.getUserOtherInfo = function (user, cb) {
	if (user == null || user.id == null) {
		Utils.invokeCallback(cb, { code: RetCode.FAIL, error: 'user is null' }, []);
	}
	Async.parallel([
		function (callback) {
			UserDao.getThirdPartById(user.id, function (err, parts) {
				if (!!err) {
					Logger.error('Get thirdpart for UserDao failed! ' + err.stack);
				}
				callback(err, parts);
			});
		},
		function (callback) {
			UserDao.getCurrencyById(user.id, function (err, currencys) {
				if (!!err) {
					Logger.error('Get currency for UserDao failed! ' + err.stack);
				}
				callback(err, currencys);
			});
		}
	],
		function (err, results) {
			if (!!err) {
				Utils.invokeCallback(cb, err);
			} else {
				Utils.invokeCallback(cb, null, results);
			}
		});
}

//=============================================================  Create Function  =============================================================
/**
 * Create a new user with phone
 * @param {String} phone
 * @param {String} password
 * @param {String} name
 * @param {function} cb Call back function.
 */
UserDao.createUserByPhone = function (phone, password, name, cb) {
	let sql = Knex('User').insert({ name: name, phone: phone, password: password }).into('user').toString();
	console.log(sql);
	pomelo.app.get('dbclient').insert(sql, function (err, res) {
		if (err !== null) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
		} else {
			console.log(res);
			var user = new User({ id: res.insertId, name: name, head: '', phone: phone, password: password, logintime: Moment().unix() });
			console.log(user);
			Utils.invokeCallback(cb, null, user);
		}
	});
};

/**
 * Create a new user with thirdpart
 * @param {number} method
 * @param {String} openid
 * @param {function} cb
 */
UserDao.createUserByThirdPart = function (method, openid, cb) {
	let sql = Knex('User').insert({}).toString();
	console.log(sql);
	pomelo.app.get('dbclient').insert(sql, function (err, res) {
		if (err !== null) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
		} else {
			var user = new User({ id: res.insertId, name: '', head: '', phone: '', password: '', logintime: Moment().unix() });
			UserDao.createUserThirdPart(res.insertId, method, openid, function (err) {
				if (err !== null) {
					Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, null);
					//删除掉创建出来的user ，不成功也没什么太大关系
					var sql = Knex('User')
						.where('id', res.insertId)
						.del().toString();
					pomelo.app.get('dbclient').delete(sql, function (err, res) { });
					return;
				}
				user.setThirdPart(method, openid);
				Utils.invokeCallback(cb, null, user);
			})

		}
	});
}

/**
 * Create third part info
 * @param {number} userid
 * @param {number} method
 * @param {String} openid
 * @param {function} cb
 */
UserDao.createUserThirdPart = function (userid, method, openid, cb) {
	var sql = Knex('ThirdPartUser').insert({ userid: userid, method: method, openid: openid }).toString();
	console.log(sql);
	pomelo.app.get('dbclient').insert(sql, function (err, res) {
		if (err !== null) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message });
		} else {
			Utils.invokeCallback(cb, null);
		}
	});
}


//=============================================================  Update Function  =============================================================
UserDao.updateToken = function (userid, token, cb) {
	console.log(token);
	console.log(userid);
	let sql = Knex('User').into('user').update({ token: token, logintime: Moment().unix() }).where({ 'id': userid }).toString();
	console.log(sql);
	pomelo.app.get('dbclient').update(sql, function (err, res) {
		if (err !== null) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, msg: err.message });
		} else {
			Utils.invokeCallback(cb, null);
		}
	});
}
//=============================================================  Check Function  =============================================================
/**
 * Check user phone exist
 * @param {String} phone
 * @param {function} cb
 */
UserDao.checkPhoneExist = function (phone, cb) {
	let sql = Knex('User').count({ count: 'phone' }).from('user').where('phone', phone).toString();
	console.log(sql);
	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, 0);
		} else {
			Utils.invokeCallback(cb, null, res[0].count);
		}
	});
}

/**
 * Check user name exist
 * @param {String} name
 * @param {function} cb
 */
UserDao.checkNameExist = function (name, cb) {
	let sql = Knex('User').count({ count: 'name' }).from('user').where('name', name).toString();
	console.log(sql);
	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, 0);
		} else {
			Utils.invokeCallback(cb, null, res[0].count);
		}
	});
}

/**
 * Check third part exist
 * @param {String} method
 * @param {String} openId
 * @param {function} cb
 */
UserDao.checkThirdPartExist = function (method, openId, cb) {
	let sql = Knex('ThirdPartUser').count({ count: 'userid' }).from('user').where('method', method).andWhere('openid', openId).toString();
	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			Utils.invokeCallback(cb, { code: RetCode.FAIL, error: err.message }, 0);
		} else {
			Utils.invokeCallback(cb, null, res[0].count);
		}
	});
}