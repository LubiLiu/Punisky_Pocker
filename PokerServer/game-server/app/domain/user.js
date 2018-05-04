/**
 *Module dependencies
 */
var logger = require('pomelo-logger').getLogger(__filename);
/**
 * Initialize a new 'User' with the given 'opts'.
 *
 * @param {Object} opts
 * @api public
 */

var User = function (opts) {
	this.id = opts.id;
	this.name = opts.name;
	this.head = opts.head;
	this.phone = opts.phone;
	this.password = opts.password;
	this.logintime = opts.logintime;
	this.thirdPart = {};
	this.currency = {};
};

/**
 * Expose 'User' constructor
 */

module.exports = User;

User.prototype.setThirdPart = function (method, openid) {
	this.thirdPart[method] = openid;
}

User.prototype.setCurrency = function (type, value) {
	if (!_.isNumber(value)) {
		return false;
	}
	this.currency[type] = value;
	return true;
}

User.prototype.canReduceCurrency = function (type, value) {
	if (!_.isNumber(value)) {
		logger.error('User.canReduceCurrency value is not number');
		return false;
	}
	if (value < 0) {
		logger.error('User.canReduceCurrency value less then 0');
		return false;
	}
	if (this.currency[type] != null) {
		return this.currency[type] >= value;
	}
	logger.error('User.canReduceCurrency value not enough');
	return false;
}

User.prototype.getCurrency = function (type) {
	if (this.currency[type] == null) {
		return 0;
	}
	return this.currency[type];
}
