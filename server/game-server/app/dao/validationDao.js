var pomelo = require('pomelo');
var Knex = require('knex');
var Moment = require('moment');

var Validation = require('../domain/validation');
var Utils = require('../../util/utils');
var RetCode = require('../../util/retcode');

var ValidationDao = module.exports;

//=============================================================  Get Function  =============================================================
/**
 * Get an Validation by phone and type
 * @param {String} phone
 * @param {int} type
 * @param {function} cb Callback function.
 */
ValidationDao.getValidation = function (phone, type, cb) {
    let sql = Knex.select('*')
        .from('Validation')
        .where('phone', phone)
        .andWhere('type', type).toString();

    pomelo.app.get('dbclient').query(sql, function (err, res) {
        if (err) {
            Utils.invokeCallback(cb, err.message, null);
        } else if (!res || res.length <= 0) {
            Utils.invokeCallback(cb, null, null);
        } else {
            var validation = new Validation(res[0]);
            Utils.invokeCallback(cb, null, validation);
        }
    });
};

//=============================================================  Create Function  =============================================================
/**
 * Create an Validation phone and type
 * @param {String} phone
 * @param {int} type
 * @param {String} code
 * @param {function} cb Callback function.
 */
ValidationDao.insertValidation = function (phone, type, code, cb) {
    ValidationDao.checkValidationExist(phone, type, function (err, count) {
        if (err !== null) {
            console.log(err);
            Utils.invokeCallback(cb, { code: RetCode.FAIL, msg: err.message }, null);
        } else {
            var validation = new Validation({ phone: phone, type: type, value: code, createTime: Moment().unix() });
            if (count > 0) {
                ValidationDao.updateValidation(validation, function (err) {
                    if (err !== null) {
                        Utils.invokeCallback(cb, { code: RetCode.FAIL, msg: err.message }, null);
                    } else {
                        Utils.invokeCallback(cb, null, validation);
                    }
                });
            } else {
                let sql = Knex('validation').insert(validation).into('validation').toString();
                console.log(sql);
                pomelo.app.get('dbclient').insert(sql, function (err, res) {
                    if (err !== null) {
                        Utils.invokeCallback(cb, { code: RetCode.FAIL, msg: err.message }, null);
                    } else {
                        Utils.invokeCallback(cb, null, validation);
                    }
                });
            }
        }
    });
};
//=============================================================  Update Function  =============================================================

/**
 * Check Validation exist
 * @param {String} phone
 * @param {int} type
 * @param {String} code
 * @param {function} cb
 */
ValidationDao.updateValidation = function (validation, cb) {
    if (null == validation) {
        Utils.invokeCallback(cb, { code: 1, msg: 'validation is null' });
        return;
    }
    console.log(validation);
    let sql = Knex('validation').into('validation').update({ value: validation.value, createTime: validation.createTime }).where({ 'phone': validation.phone, 'type': validation.type }).toString();
    console.log(sql);
    pomelo.app.get('dbclient').update(sql, function (err, res) {
        if (err !== null) {
            Utils.invokeCallback(cb, { code: RetCode.FAIL, msg: err.message });
        } else {
            Utils.invokeCallback(cb, null);
        }
    });
}

//=============================================================  Check Function  =============================================================
/**
 * Check Validation exist
 * @param {String} phone
 * @param {int} type
 * @param {function} cb
 */
ValidationDao.checkValidationExist = function (phone, type, cb) {
    let sql = Knex('validation').count({ count: 'value' }).from('validation').where('phone', phone).andWhere('type', type).toString();
    pomelo.app.get('dbclient').query(sql, function (err, res) {
        if (err !== null) {
            Utils.invokeCallback(cb, { code: RetCode.FAIL, msg: err.message }, 0);
        } else {
            Utils.invokeCallback(cb, null, res[0].count);
        }
    });
}