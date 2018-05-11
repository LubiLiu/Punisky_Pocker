/**
 *Module dependencies
 */
var logger = require('pomelo-logger').getLogger(__filename);

var Room = require('./room');
/**
 * Initialize a new 'Room' with the given 'opts'.
 * 这个类包含一个房间的基本数据 其他类型的房间都包含这个数据
 *
 * @param {Object} opts
 * @api public
 */

var TexasRoom = function (opts) {
    this.baseRoom = new Room(opts);
    this.rule = opts.rule;
    this.gamers = [];
    this.table = null;
    this.seats = [];
};


TexasRoom.createTexasRoom = function (opts) {
    let room = new TexasRoom(opts);
    return room;
}

module.exports = TexasRoom;