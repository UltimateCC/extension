/* eslint-env node */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	rules: {
		"@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],
		"@typescript-eslint/no-unsafe-declaration-merging": "off",
		"prefer-template": "error"
	}
};