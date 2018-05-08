var Moment = require('moment');

module.exports = function (app, opts) {
    return new RoomManager(app, opts);
};
var RoomManager = function (app, opts) {
    this.lastTick = Moment().unix();

};

RoomManager.name = 'RoomManager';

RoomManager.prototype.start = function (cb) {
    console.log('Hello World Start');
    var self = this;
    //开始tick
    this.timerId = setInterval(function () {
        this.function();
    }.bind(this), this.interval);
    process.nextTick(cb);
}

RoomManager.prototype.afterStart = function (cb) {
    console.log('Hello World afterStart');
    process.nextTick(cb);
}

RoomManager.prototype.stop = function (force, cb) {
    console.log('Hello World stop');
    if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
    }
    process.nextTick(cb);
}


RoomManager.prototype.update = function () {
    //TODO
    this.lastTick = Moment().unix();
}
/**
 * 创建房间
 * @param {Object} user 
 * @param {Number} roomtype 
 * @param {String} name 
 * @param {Object} rule 
 * @param {Number} duration 
 * @param {Function} cb 
 */
RoomManager.prototype.createRoom = function (user, roomtype, name, rule, duration, cb) {
}
