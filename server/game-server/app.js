var pomelo = require('pomelo');
var route = require('./app/route/index');

var RoomManager = require('./app/components/roomManager');

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
  route(app);
  // app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');
  app.loadConfig('mysql', app.getBase() + '\\config\\mysql.json');
});

// Configure database
app.configure('production|development', 'gate|connector|master|user|hall|room', function () {
  var dbclient = require('./app/dao/mysql/mysql').init(app);
  app.set('dbclient', dbclient);
});

// app configuration

app.configure('production|development', 'gate', function () {
  app.set('connectorConfig',
    {
      connector: pomelo.connectors.hybridconnector,
      useProtobuf: true
    });
});
app.configure('production|development', 'connector', function () {
  app.set('connectorConfig',
    {
      connector: pomelo.connectors.hybridconnector,
      heartbeat: 3,
      useDict: true,
      useProtobuf: true
    });
});

app.configure('production|development', 'user', function () {
  app.set('connectorConfig',
    {
      connector: pomelo.connectors.hybridconnector,
      useProtobuf: true
    });
});


app.configure('production|development', 'hall', function () {
  app.set('connectorConfig',
    {
      connector: pomelo.connectors.hybridconnector,
      useProtobuf: true
    });
});


app.configure('production|development', 'room', function () {
  app.set('connectorConfig',
    {
      connector: pomelo.connectors.hybridconnector,
      useProtobuf: true
    });
  app.load(RoomManager, {});
});

// start app
app.start();


process.on('uncaughtException', function (err) {
  console.error(' Caught exception: ' + err.stack);
});
