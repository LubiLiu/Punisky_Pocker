module.exports = {
    OK: 200,
    FAIL: 500,
    INVALID_PARAM: 501,
    GATE: {
        NO_CONNECTOR: 1001
    },
    USER: {
        USER_EXIST: 2001,
        NAME_DUPLICATE: 2002,
        NO_VALIDATION_CODE: 2003,
        VALIDATION_TIMEOUT: 2004,
        VALIDATION_ERROR: 2005,
        USER_NOT_EXIST: 2006,
        PASSWORD_ERROR: 2007,
        TOKEN_ERROR: 2008,
        NEED_LOGIN: 2009,
    }
};