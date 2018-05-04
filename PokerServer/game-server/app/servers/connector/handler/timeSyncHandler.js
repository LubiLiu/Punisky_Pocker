var moment = require('moment');

var define = require('../../../../../shared/define');
var handler = module.exports;

handler.timeSync = function(msg, session, next) {
  next(null, {code: define.OK,msg: moment().unix()});
};
