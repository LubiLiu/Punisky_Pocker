var Async = require('async');
var Moment = require('moment');
var _ = require('lodash');

var Define = require('../../../../util/define');
var RetCode = require('../../../../util/retcode');
var Util = require('../../../../util/utils');
var Token = require('../../../../util/token');

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
        next(null, { code: RetCode.INVALID_PARAM, msg: 'lost params : ' + Util.joinArray(lostParams) });
        return;
    }
    var phone = msg.phone, vtype = msg.vtype;
    //生成验证码
    let code = Util.zeroPadding(Util.getRandomInt(0, 1000000), 6);
    ValidationDao.insertValidation(phone, vtype, code, function (err, validation) {
        if (err != null) {
            next(null, err);
        } else {
            //
            next(null, { code: RetCode.OK, msg: validation });
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
    let lostParams = Util.checkParams(msg, ['phone', 'name', 'password', 'validation']);
    if (lostParams.length > 0) {
        next(null, { code: RetCode.INVALID_PARAM, msg: 'lost params : ' + Util.joinArray(lostParams) });
        return;
    }
    let retMsg = null;
    Async.waterfall([
        function (anext) {
            //看看有没有这个用户
            UserDao.checkPhoneExist(msg.phone, function (err, count) {
                if (err != null) {
                    return anext(err);
                }
                if (count > 0) {
                    retMsg = { code: RetCode.USER.USER_EXIST, msg: '该用户已存在 : ' + msg.phone };
                }
                neanextxt(null);
            })
        },
        function (anext) {
            if (retMsg != null) {
                return anext(null);
            }
            //看看有没有重名
            UserDao.checkNameExist(msg.name, function (err, count) {
                if (err != null) {
                    return anext(err);
                }
                if (count > 0) {
                    retMsg = { code: RetCode.USER.NAME_DUPLICATE, msg: '玩家重名 : ' + msg.name };
                }
                anext(null);
            })
        },
        function (anext) {
            if (retMsg != null) {
                return anext(null);
            }
            //检查验证码是否有效
            ValidationDao.getValidation(msg.phone, Define.VALIDATION_TYPE.REGISTE, function (err, validation) {
                if (err != null) {
                    return anext(err);
                }
                if (validation == null) {
                    retMsg = { code: RetCode.USER.NO_VALIDATION_CODE, msg: '没有改手机的验证码 : ' + msg.phone };
                } else {
                    if (Moment().unix() - validation.createTime > Define.CONST_DEFINE.VALIDATION_TIMEOUT) {
                        retMsg = { code: RetCode.USER.VALIDATION_TIMEOUT, msg: '验证码已失效 : ' + msg.phone };
                    } else if (msg.validation.toString() != validation.value) {
                        retMsg = { code: RetCode.USER.VALIDATION_ERROR, msg: '验证码错误 : ' + msg.validation };
                    }
                }
                anext(null);
            });
        },
        function (anext) {
            if (retMsg != null) {
                return anext(null);
            }
            //都检查完了，可以创建了
            UserDao.createUserByPhone(msg.phone, msg.password, msg.name, function (err, user) {
                anext(err, user);
            });
        },
        function (anext, user) {
            if (retMsg != null) {
                return anext(null);
            }
            //顺便登录了
            var token = Token.createToken(user);
            UserDao.updateToken(user.id, token, function (err) {
                if (err != null) {
                    return anext(err);
                }
                user.token = token;
                anext(null, user);
            });
        }
    ], function (err, result) {
        if (err) {
            next(null, err);
        } else {
            if (retMsg != null) {
                next(null, retMsg);
            } else {
                next(null, { code: RetCode.OK, msg: { id: result.id, token: result.token } });
            }
        }
    });
};

/**
 * 使用手机登陆
 * @param {Object} msg 
 * @param {Object} session 
 * @param {Function} next
 */
Handler.prototype.loginByPhonePass = function (msg, session, next) {
    let lostParams = Util.checkParams(msg, ['phone', 'password']);
    if (lostParams.length > 0) {
        next(null, { code: RetCode.INVALID_PARAM, msg: 'lost params : ' + Util.joinArray(lostParams) });
        return;
    }
    let retMsg = null;
    Async.waterfall([
        function (anext) {
            //加载出这个玩家看看
            UserDao.getUserByPhone(msg.phone, function (err, user) {
                if (err != null) {
                    return anext(err);
                }
                if (user == null) {
                    retMsg = { code: RetCode.USER.USER_NOT_EXIST, msg: '该用户不存在 : ' + msg.phone };
                }
                //看看密码对不对吧
                if (user.password != msg.password) {
                    retMsg = { code: RetCode.USER.PASSWORD_ERROR, msg: '密码错误 : ' + msg.phone };
                }
                neanextxt(null, user);
            })
        },
        function (anext, user) {
            if (retMsg != null) {
                return anext(null);
            }
            //生成个token给客户端
            var token = Token.createToken(user);
            UserDao.updateToken(user.id, token, function (err) {
                if (err != null) {
                    return anext(err);
                }
                user.token = token;
                anext(null, user);
            });
        },
    ], function (err, result) {
        if (err) {
            next(null, err);
        } else {
            if (retMsg != null) {
                next(null, retMsg);
            } else {
                next(null, { code: RetCode.OK, msg: { id: result.id, token: result.token } });
            }
        }
    });
}

/**
 * 使用手机验证码登录
 * @param {Object} msg 
 * @param {Object} session 
 * @param {Function} next
 */
Handler.prototype.loginByPhonePass = function (msg, session, next) {
    let lostParams = Util.checkParams(msg, ['phone', 'validation']);
    if (lostParams.length > 0) {
        next(null, { code: RetCode.INVALID_PARAM, msg: 'lost params : ' + Util.joinArray(lostParams) });
        return;
    }
    let retMsg = null;
    Async.waterfall([
        function (anext) {
            //检查验证码是否有效
            ValidationDao.getValidation(msg.phone, Define.VALIDATION_TYPE.QUICK_LOGIN, function (err, validation) {
                if (err != null) {
                    return anext(err);
                }
                if (validation == null) {
                    retMsg = { code: RetCode.USER.NO_VALIDATION_CODE, msg: '没有该手机的验证码 : ' + msg.phone };
                } else {
                    if (Moment().unix() - validation.createTime > Define.CONST_DEFINE.VALIDATION_TIMEOUT) {
                        retMsg = { code: RetCode.USER.VALIDATION_TIMEOUT, msg: '验证码已失效 : ' + msg.phone };
                    } else if (msg.validation.toString() != validation.value) {
                        retMsg = { code: RetCode.USER.VALIDATION_ERROR, msg: '验证码错误 : ' + msg.validation };
                    }
                }
                anext(null);
            });
        },
        function (anext) {
            if (retMsg != null) {
                return anext(null);
            }
            //验证成功 把这个玩家加载出来看看
            UserDao.getUserByPhone(msg.phone, function (err, user) {
                if (err != null) {
                    return anext(err);
                }
                if (user == null) {
                    retMsg = { code: RetCode.USER.USER_NOT_EXIST, msg: '该用户不存在 : ' + msg.phone };
                }
                //看看密码对不对吧
                if (user.password != msg.password) {
                    retMsg = { code: RetCode.USER.PASSWORD_ERROR, msg: '密码错误 : ' + msg.phone };
                }
                neanextxt(null, user);
            })
        },
        function (anext, user) {
            if (retMsg != null) {
                return anext(null);
            }
            //没啥问题 生成个token给客户端
            var token = Token.createToken(user);
            UserDao.updateToken(user.id, token, function (err) {
                if (err != null) {
                    return anext(err);
                }
                user.token = token;
                anext(null, user);
            });
        },
    ], function (err, result) {
        if (err) {
            next(null, err);
        } else {
            if (retMsg != null) {
                next(null, retMsg);
            } else {
                next(null, { code: RetCode.OK, msg: { id: result.id, token: result.token } });
            }
        }
    });
}

//TODO 第三方登录