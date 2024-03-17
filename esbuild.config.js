const esbuild = require("esbuild");
const process = require("process");
const builtins = require("builtin-modules");

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
		...builtins],
	format: "cjs",
	target: "es2018",
	logLevel: "debug",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
}