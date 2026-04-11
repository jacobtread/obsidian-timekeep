import { builtinModules } from "module";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig((env) => {
	return {
		build: {
			outDir: "dist",
			sourcemap: env.mode === "production" ? false : "inline",
			target: "es2018",
			minify: env.mode === "production",
			lib: {
				entry: "src/main.ts",
				formats: ["cjs"],
				fileName: () => "main.js",
			},
			rolldownOptions: {
				input: {
					main: path.resolve(__dirname, "src/main.ts"),
					styles: path.resolve(__dirname, "src/styles.css"),
				},
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
					...builtinModules,
				],
				output: {
					exports: "auto",
				},
			},
			//
			cssCodeSplit: true,
			// Inline all assets (.ttf ...etc)
			assetsInlineLimit: Infinity,
		},

		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
				pdfmake: "pdfmake/build/pdfmake",
				...(env.mode === "test"
					? {
							// Test stub overrides
							obsidian: path.resolve(__dirname, "src", "__mocks__", "obsidianStub"),
							electron: path.resolve(__dirname, "src", "__mocks__", "electronStub"),
						}
					: {}),
			},
		},

		test: {
			setupFiles: path.resolve(__dirname, "src", "__mocks__", "setupObsidianMocks.ts"),
			coverage: {
				// Exclude mocks and fixtures from coverage
				exclude: [
					"**/__mocks__/**",
					"**/__fixtures__/**",
					"*.ttf",
					"**/components/**/index.ts",
				],
			},
		},
	};
});
