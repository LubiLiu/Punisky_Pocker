var logger = require('pomelo-logger').getLogger(__filename);
var async = require('async');
var knex = require('knex');
var moment = require('moment');

var User = require('../domain/user');
var define = require('../..//util/define');
var utils = require('../../util/utils');
var retCode = require('../../util/retcode');

var userDao = module.exports;

//=============================================================  Get Function  =============================================================
/**
 * Get an user by userId
 * @param {Number} uid User Id.
 * @param {function} cb Callback function.
 */
userDao.getUserById = function (uid, cb) {
	let sql = knex.select('*')
		.from('User')
		.where('id', uid).toString();

	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err) {
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0) {
			utils.invokeCallback(cb, null, null);
		} else {
			var user = new User(res[0]);
			userDao.getUserOtherInfo(user, function (err, results) {
				if (err) {
					utils.invokeCallback(cb, err.message, null);
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
				utils.invokeCallback(cb, null, user);
			});
		}
	});
};


/**
 * get user by Name
 * @param {String} name User name
 * @param {function} cb Callback function
 */
userDao.getUserByName = function (name, cb) {
	let sql = knex.select('*')
		.from('User')
		.where('name', name).toString();


	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0) {
			utils.invokeCallback(cb, null, null);
		} else {
			var user = new User(res[0]);
			userDao.getUserOtherInfo(user, function (err, results) {
				if (err) {
					utils.invokeCallback(cb, err.message, null);
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
				utils.invokeCallback(cb, null, user);
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
userDao.getUserByThirdPart = function (method, openid, cb) {
	let sql = knex.select('*')
		.from('ThirdPartUser')
		.where('method', method)
		.andWhere('openid', openid).toString();

	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else if (!res || res.length <= 0) {
			utils.invokeCallback(cb, null, null);
		} else {
			var part = res[0];
			userDao.getUserById(part.userid, function (err, user) {
				if (err !== null) {
					utils.invokeCallback(cb, err.message, null);
				} else {
					utils.invokeCallback(cb, null, user);
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
userDao.getThirdPartById = function (uid, cb) {
	let sql = knex.select('*')
		.from('ThirdPartUser')
		.where('userid', uid).toString();


	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

/**
 * get currency by id
 * @param {String} uid User id
 * @param {function} cb Callback function
 */
userDao.getCurrencyById = function (uid, cb) {
	let sql = knex.select('*')
		.from('Currency')
		.where('userid', uid).toString();


	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, err.message, null);
		} else {
			utils.invokeCallback(cb, null, res);
		}
	});
};

/**
 * Get all the information of a player, include equipments, bag, skills, tasks.
 * @param {String} playerId
 * @param {function} cb
 */

userDao.getUserOtherInfo = function (user, cb) {
	if (user == null || user.id == null) {
		utils.invokeCallback(cb, 'user is null', []);
	}
	async.parallel([
		function (callback) {
			userDao.getThirdPartById(user.id, function (err, parts) {
				if (!!err) {
					logger.error('Get thirdpart for userDao failed! ' + err.stack);
				}
				callback(err, parts);
			});
		},
		function (callback) {
			userDao.getCurrencyById(user.id, function (err, currencys) {
				if (!!err) {
					logger.error('Get currency for userDao failed! ' + err.stack);
				}
				callback(err, currencys);
			});
		}
	],
		function (err, results) {
			if (!!err) {
				utils.invokeCallback(cb, err);
			} else {
				utils.invokeCallback(cb, null, results);
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
userDao.createUserByPhone = function (phone, password, name, cb) {
	let sql = knex('User').insert({ name: name, phone: phone, password: password }).toString();
	pomelo.app.get('dbclient').insert(sql, function (err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, { code: retCode.FAIL, error: err.message }, null);
		} else {
			var user = new User({ id: res.insertId, name: name, head: '', phone: phone, password: password, logintime: moment().unix() });
			utils.invokeCallback(cb, null, user);
		}
	});
};

/**
 * Create a new user with thirdpart
 * @param {number} method
 * @param {String} openid
 * @param {function} cb
 */
userDao.createUserByThirdPart = function (method, openid, cb) {
	let sql = knex('User').insert({}).toString();
	pomelo.app.get('dbclient').insert(sql, function (err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, { code: retCode.FAIL, error: err.message }, null);
		} else {
			var user = new User({ id: res.insertId, name: '', head: '', phone: '', password: '', logintime: moment().unix() });
			userDao.createUserThirdPart(res.insertId, method, openid, function (err) {
				if (err !== null) {
					utils.invokeCallback(cb, { code: retCode.FAIL, error: err.message }, null);
					//删除掉创建出来的user ，不成功也没什么太大关系
					var sql = knex('User')
						.where('id', res.insertId)
						.del().toString();
					pomelo.app.get('dbclient').delete(sql, function (err, res) { });
					return;
				}
				user.setThirdPart(method, openid);
				utils.invokeCallback(cb, null, user);
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
userDao.createUserThirdPart = function (userid, method, openid, cb) {
	var sql = knex('ThirdPartUser').insert({ userid: userid, method: method, openid: openid }).toString();
	pomelo.app.get('dbclient').insert(sql, function (err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, { code: retCode.FAIL, error: err.message });
		} else {
			utils.invokeCallback(cb, null);
		}
	});
}


//=============================================================  Update Function  =============================================================

//=============================================================  Check Function  =============================================================
/**
 * Check user phone exist
 * @param {String} phone
 * @param {function} cb
 */
userDao.checkPhoneExist = function (phone, cb) {
	let sql = knex('User').count({ count: 'phone' }).where('phone', phone).toString();
	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, { code: retCode.FAIL, error: err.message }, 0);
		} else {
			utils.invokeCallback(cb, null, res[0].count);
		}
	});
}

/**
 * Check user name exist
 * @param {String} name
 * @param {function} cb
 */
userDao.checkNameExist = function (name, cb) {
	let sql = knex('User').count({ count: 'name' }).where('name', name).toString();
	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, { code: retCode.FAIL, error: err.message }, 0);
		} else {
			utils.invokeCallback(cb, null, res[0].count);
		}
	});
}

/**
 * Check third part exist
 * @param {String} method
 * @param {String} openId
 * @param {function} cb
 */
userDao.checkThirdPartExist = function (method, openId, cb) {
	let sql = knex('ThirdPartUser').count({ count: 'userid' }).where('method', method).andWhere('openid', openId).toString();
	pomelo.app.get('dbclient').query(sql, function (err, res) {
		if (err !== null) {
			utils.invokeCallback(cb, { code: retCode.FAIL, error: err.message }, 0);
		} else {
			utils.invokeCallback(cb, null, res[0].count);
		}
	});
}