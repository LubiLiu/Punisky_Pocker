var _ = require('lodash');

var Util = require('../../util/utils');
var Define = require('../../util/define');

//分配到userserver
var userRoute = function (routeParam, msg, context, cb) {
    var users = this.app.getServersByType('user');
    if (!users || users.length == 0) {
        cb(new Error('No Usable User Server'));
        return;
    }
    var res = users[Util.getRandomInt(0, users.length)];
    cb(null, res.id);
}

//分配到hallserver
var hallRoute = function (routeParam, msg, context, cb) {
    var halls = this.app.getServersByType('hall');
    if (!halls || halls.length == 0) {
        cb(new Error('No Usable User Server'));
        return;
    }
    var res = halls[Util.getRandomInt(0, halls.length)];
    cb(null, res.id);
}

//分配到roomserver
var roomRoute = function (session, msg, context, cb) {
    if (!session || !session.get(Define.SESSION_KEY.ROOM_SERVERID)) {
        cb(new Error('No Room Entered'));
        return;
    }
    cb(null, session.get(Define.SESSION_KEY.ROOM_SERVERID));
}

var initRoutes = function (app) {
    app.route('user', userRoute);
    app.route('hall', hallRoute);
    app.route('room', roomRoute);
}

module.exports = initRoutes;