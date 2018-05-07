var RetCode = require('../../../../util/retcode');
var Util = require('../../../../util/utils');

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
 * 要登录到connector server了，前期要登录成功后有了uid才给登
 * @param {*} msg 
 * @param {*} session 
 * @param {*} next 
 */
Handler.prototype.queryEntry = function (msg, session, next) {
	let lostParams = Util.checkParams(msg, ['uid']);
	if (lostParams.length > 0) {
		next(null, { code: RetCode.INVALID_PARAM, msg: 'lost params : ' + Util.joinArray(lostParams) });
		return;
	}
	var connectors = this.app.getServersByType('connector');
	if (!connectors || connectors.length === 0) {
		next(null, { code: RetCode.GATE.NO_CONNECTOR, error: 'No Usable Connector' });
		return;
	}
	//random one connector
	var uid = parseInt(msg.uid);
	var res = connectors[uid % connectors.length];
	next(null, { code: RetCode.OK, host: res.host, port: res.clientPort });
};