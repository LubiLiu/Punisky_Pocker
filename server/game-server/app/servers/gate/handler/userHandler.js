var Code = require('../../../../util/retcode');
var Util = require('../../../../util/utils');

var ValidationDao = require('../../../dao/validationDao');
var UserDao = require('../../../dao/userDao');

/**
 * Gate handler that dispatch user to connectors.
 */
module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

/**
 * 获取验证码
 * @param {Object} msg 
 * @param {Object} session 
 * @param {Function} next 
 */
Handler.prototype.sendValidation = function (msg, session, next) {
    let lostParams = Util.checkParams(msg, ['phone', 'vtype']);
    if (lostParams.length > 0) {
        next(null, { code: Code.INVALID_PARAM, msg: 'lost params : ' + Util.joinArray(lostParams) });
        return;
    }
    var phone = msg.phone, vtype = msg.vtype;
    //生成验证码
    let code = Util.zeroPadding(Util.getRandomInt(0, 1000000), 6);
    ValidationDao.insertValidation(phone, vtype, code, function (err, validation) {
        if (err != null) {
            next(null, err);
        } else {
            next(null, { code: Code.OK, msg: validation });
        }
    });
}

/**
 * 使用手机注册
 * @param {Object} msg 
 * @param {Object} session 
 * @param {Function} next 
 */
Handler.prototype.registerByPhone = function (msg, session, next) {
    let lostParams = Util.checkParams(msg, ['phone']);
    if (lostParams.length > 0) {
        next(null, { code: Code.INVALID_PARAM, msg: 'lost params : ' + Util.joinArray(lostParams) });
        return;
    }
};

/**
 * 使用手机登陆
 * @param {Object} msg 
 * @param {Object} session 
 * @param {Function} next
 */
Handler.prototype.loginByPhone = function (msg, session, next) {
    let lostParams = Util.checkParams(msg, ['phone']);
    if (lostParams.length > 0) {
        next(null, { code: Code.INVALID_PARAM, msg: 'lost params : ' + Util.joinArray(lostParams) });
        return;
    }

}