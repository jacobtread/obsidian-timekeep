/* eslint-disable */

const process = require("process");
const { builtinModules } = require('node:module');

const prod = (process.argv[2] === "production");


module.exports = {
	platform: "browser",
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtinModules],
	format: "cjs",
	target: "es2018",
	logLevel: "debug",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	loader: { '.ttf': 'dataurl' },
}