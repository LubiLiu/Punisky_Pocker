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
        // 测试注册
        GameInstance.connectToServer("127.0.0.1", 3101, function (msg) {
            GameInstance.requestToServer('gate.userHandler.sendValidation', { phone: '13585533803', vtype: Define.VALIDATION_TYPE.REGISTE }, function (msg) {
                cc.log(msg.msg.value);
                GameInstance.requestToServer('gate.userHandler.registerByPhone', { phone: '13585533803', name: 'Franky', password: '123123', validation: msg.msg.value }, function (msg) {
                    cc.log(msg);
                })
            })
        });

        // 测试手机验证码登陆
        // GameInstance.connectToServer("127.0.0.1", 3101, function (msg) {
        //     GameInstance.requestToServer('gate.userHandler.sendValidation', { phone: '13585533803', vtype: Define.VALIDATION_TYPE.QUICK_LOGIN }, function (msg) {
        //         cc.log(msg.msg.value);
        //         GameInstance.requestToServer('gate.userHandler.loginByPhoneValidation', { phone: '13585533803', validation: msg.msg.value }, function (msg) {
        //             cc.log(msg);
        //         })
        //     })
        // });

        //测试手机密码登陆
        // GameInstance.connectToServer("127.0.0.1", 3101, function (msg) {
        //     GameInstance.requestToServer('gate.userHandler.loginByPhonePass', { phone: '13585533803', password: '123123' }, function (msg) {
        //         cc.log(msg);
        //     })
        // });


    },

    // called every frame
    update: function (dt) {

    },
});
