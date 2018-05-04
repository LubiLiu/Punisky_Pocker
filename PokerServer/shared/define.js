module.exports = {
	// ============================================= msg ret code ==================================================
	OK: 200,
	FAIL: 500,
	INVALIDPARAM: 501,

	USER: {
		USER_EXISTED: 1001,
		USER_NOT_EXISTED: 1002,
		USER_NO_VALIDATION: 1003,
		USER_VALIDATION_TIMEOUT: 1004,
		USER_VALIDATION_ERR: 1005,
	},

	GATE: {
		FA_NO_SERVER_AVAILABLE: 2001
	},
	// ============================================= enum type ====================================================
	ThirdPartMethod: {
		WX: 1,
	},
	CurrencyType: {
		Gold: 1,
		Diamond: 2,
		End: 3,
	},
	ValidationType: {
		Registe: 1,
		QuickLogin: 2,
	},
	// ============================================= const value ====================================================
	ValidationTimeout: 300,
} 
