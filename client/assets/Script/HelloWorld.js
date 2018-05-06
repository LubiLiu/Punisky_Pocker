var GameInstance = require('./Services/GameInstance');
var Define = require('./util/define');
cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        // defaults, set visually when attaching this script to the Canvas
        text: 'Hello, World!'
    },

    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;
        // GameInstance.connectToServer("127.0.0.1", 3101, function (msg) {
        //     GameInstance.requestToServer('gate.userHandler.sendValidation', { phone: '13585533803', vtype: Define.VALIDATION_TYPE.REGISTE }, function (msg) {
        //         cc.log(msg);
        //     })
        // });
        pomelo.init({
            host: "127.0.0.1",
            port: 3101,
            log: true
        }, function (msg) {
            cc.log(msg)
            pomelo.request('gate.userHandler.sendValidation', { phone: '13585533803', vtype: Define.VALIDATION_TYPE.REGISTE}, function (msg) {
                cc.log(msg);
                // pomelo.disconnect(function () {
                //     pomelo.init({
                //         host: msg.host,
                //         port: msg.port,
                //         reconnect: true
                //     }, function () {
                //         pomelo.request('connector.entryHandler.entry', {}, function (msg) {
                //             cc.log(msg);
                //         });
                //     })
                // });
            })
        });
    },

    // called every frame
    update: function (dt) {

    },
});
