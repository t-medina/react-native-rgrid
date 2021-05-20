module.exports = {
	"env": {
		"browser": true,
		"es2021": true,
		"react-native/react-native": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:react/recommended",
		"plugin:react-native/all"
	],
	"parser": "@babel/eslint-parser",
	"parserOptions": {
		"ecmaFeatures": {
			"jsx": true
		},
		"ecmaVersion": 12,
		"sourceType": "module"
	},
	"plugins": [
		"react",
		"react-native"
	],
	"settings": {
		"react": {
			"version": "detect"
		}
	},
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		]
	}
};
