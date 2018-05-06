var Define = require('../util/define');

var exp = module.exports;

exp.game = function (session, msg, app, cb) {
    var serverId = session.get(Define.SESSION_KEY.GAME_SERVERID);

    if (!serverId) {
        cb(new Error('can not find server info for type: ' + msg.serverType));
        return;
    }

    cb(null, serverId);
};

