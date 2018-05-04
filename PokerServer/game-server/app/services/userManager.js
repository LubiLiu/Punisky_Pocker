
var utils = require('../util/utils');
var userDao = require('../dao/userDao');

var exp = module.exports;

var gUsesrList = {};

exp.userLogin = function (phone, pass) {

};

exp.getUser = function (uid, cb) {
    if (gUsesrList[uid] != null) {
        utils.invokeCallback(cb, null, gUsesrList[uid]);
    } else {
        userDao.getUserById(uid, function (err, user) {
            if (err !== null) {
                utils.invokeCallback(cb, err, null);
            } else {
                gUsesrList[uid] = user;
                utils.invokeCallback(cb, null, user);
            }
        });
    }
}
exp.addUser = function (user) {
    if (user == null || user.id == null) {
        return;
    }
    gUsesrList[user.id] = user;
}



