/**
 *Module dependencies
 */
var logger = require('pomelo-logger').getLogger(__filename);
/**
 * Initialize a new 'Room' with the given 'opts'.
 * 这个类包含一个房间的基本数据 其他类型的房间都包含这个数据
 *
 * @param {Object} opts
 * @api public
 */

var Room = function (opts) {
    if (opts.id) {
        this.id = opts.id;
    }
    this.type = opts.type;
    this.name = opts.name;
    this.invitecode = opts.invitecode;
    this.serverid = opts.serverid;
    this.creatorid = opts.creatorid;
    this.creatorname = opts.creatorname;
    this.timeout = opts.timeout;
    this.createTime = opts.createTime;
};

/**
 * Expose 'Room' constructor
 */

module.exports = Room;