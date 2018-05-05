/**
 *Module dependencies
 */


/**
 * Initialize a new 'User' with the given 'opts'.
 *
 * @param {Object} opts
 * @api public
 */

var Validation = function (opts) {
    this.phone = opts.phone;
    this.type = opts.type;
    this.value = opts.value;
    this.createTime = opts.createTime;
};

/**
 * Expose 'Entity' constructor
 */

module.exports = Validation;
