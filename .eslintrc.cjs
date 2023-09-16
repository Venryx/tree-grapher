module.exports = {
	extends: [
		"vbase",
	],
	settings: {},
	rules: {
		"prefer-arrow-callback": "off", // so we can add names to comp-funcs without eslint complaining
	},
	globals: {},
};