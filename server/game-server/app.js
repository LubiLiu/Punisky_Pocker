var pomelo = require('pomelo');

var routeUtil = require('./util/routeUtil');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'server');

// configure for global
app.configure('production|development', function () {

  // // proxy configures
  // app.set('proxyConfig', {
  //   cacheMsg: true,
  //   interval: 30,
  //   lazyConnection: true
  //   // enableRpcLog: true
  // });

  // // remote configures
  // app.set('remoteConfig', {
  //   cacheMsg: true,
  //   interval: 30
  // });

  // route configures
  app.route('game', routeUtil.game);

  // app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');
  app.loadConfig('mysql', app.getBase() + '\\config\\mysql.json');
});

// Configure database
app.configure('production|development', 'gate|connector|master', function () {
  var dbclient = require('./app/dao/mysql/mysql').init(app);
  app.set('dbclient', dbclient);
});

// app configuration
app.configure('production|development', 'connector', function () {
  app.set('connectorConfig',
    {
      connector: pomelo.connectors.hybridconnector,
      heartbeat: 3,
      useDict: true,
      useProtobuf: true
    });
});

app.configure('production|development', 'gate', function () {
  app.set('connectorConfig',
    {
      connector: pomelo.connectors.hybridconnector,
      useProtobuf: true
    });
});

app.configure('production|development', 'game', function () {

})

// start app
app.start();

process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
