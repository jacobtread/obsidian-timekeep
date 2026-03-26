import { defineConfig } from "vite";
import { builtinModules } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig((env) => ({
    build: {
        outDir: "dist",
        sourcemap: env.mode === "production" ? false : "inline",
        target: "es2018",
        minify: true,
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
        },
    },

    test: {},
}));
