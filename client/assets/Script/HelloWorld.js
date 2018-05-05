
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
        pomelo.init({
            host: "127.0.0.1",
            port: 3101,
            log: true
        }, function () {
            pomelo.request('gate.gateHandler.queryEntry', {}, function (msg) {
                cc.log(msg);
                pomelo.disconnect(function () {
                    pomelo.init({
                        host: msg.host,
                        port: msg.port,
                        reconnect: true
                    }, function () {
                        pomelo.request('connector.entryHandler.entry', {}, function (msg) {
                            cc.log(msg);  
                        });
                    })
                });
            })
        });
    },

    // called every frame
    update: function (dt) {

    },
});
