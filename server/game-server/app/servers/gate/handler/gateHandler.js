var Code = require('../../../../util/retcode');
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

Handler.prototype.queryEntry = function (msg, session, next) {
	var connectors = this.app.getServersByType('connector');
	if (!connectors || connectors.length === 0) {
		next(null, { code: Code.GATE.NO_CONNECTOR, error: 'No Usable Connector' });
		return;
	}
	//random one connector
	var res = connectors[Util.getRandomInt(0, connectors.length)];
	next(null, { code: Code.OK, host: res.host, port: res.clientPort });
};