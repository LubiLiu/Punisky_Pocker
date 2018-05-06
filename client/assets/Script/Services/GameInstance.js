require('../Library/pomelo-creator-client');

var Util = require('../util/utils');
var Code = require('../util/retcode');
var GameInstance = function () {
    this.connectedServer = null;
    pomelo.on('close', function (event) {
        console.log(event);
        this.connectedServer = null;
    }.bind(this));
}

GameInstance.prototype.connectToServer = function (ip, port, cb) {
    this.lastIp = ip;
    this.lastPort = port;
    pomelo.init({
        host: ip,
        port: port,
        log: true
    }, function (msg) {
        this.connectedServer = msg;
        Util.invokeCallback(cb, msg);
    }.bind(this));
};

GameInstance.prototype.disconnectToServer = function (cb) {
    pomelo.disconnect(function () {
        Util.invokeCallback(cb);
    })
}

GameInstance.prototype.reconnect = function (cb) {
    if (this.connectedServer == null) {
        this.connectedServer(this.lastIp, this.lastPort, cb);
    }
}

GameInstance.prototype.requestToServer = function (route, data, cb) {
    if (this.connectedServer == null) {
        Util.invokeCallback(cb, { code: Code.INVALID_CONNECT, msg: 'websocket disconnect' });
        return;
    }
    pomelo.request(route, data, cb);
}

GameInstance.prototype.connectedServer = function () {
    return this.connectedServer;
}

module.exports = new GameInstance;
