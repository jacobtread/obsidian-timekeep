const path = require("path");
const fs = require('fs/promises');
const esbuild = require("esbuild");
const chokidar = require("chokidar");

const esbuildConfig = require('../esbuild.config');

async function dev() {
    const rootPath = path.join(__dirname, "../");
    const manifestPath = path.join(rootPath, "manifest.json");
    const outputPath = path.join(rootPath, "dist");
    const srcPath = path.join(rootPath, "src");

    const manifestContents = await fs.readFile(manifestPath);
    const manifest = JSON.parse(manifestContents);

    const vaultPath = path.join(rootPath, "test-vault");
    const pluginPath = path.join(vaultPath, ".obsidian", "plugins", manifest.id);

    // Setup path to the plugin
    const pluginPathExists = await dirExists(pluginPath);
    if (!pluginPathExists) {
        fs.mkdir(pluginPath, { recursive: true });
    }

    // Setup output path
    const outputExists = await dirExists(outputPath);
    if (!outputExists) {
        fs.mkdir(outputPath, { recursive: true });
    }

    const inputFiles = [
        path.join(outputPath, 'main.js'),
        path.join(outputPath, 'styles.css'),
        manifestPath,
    ];

    // Setup esbuild
    const ctx = await esbuild.context({
        ...esbuildConfig,
        entryPoints:
            [
                path.join(srcPath, "main.ts"),
                path.join(srcPath, 'styles.css')
            ],
        bundle: true,
        outdir: path.join(outputPath),
    });


    // Perform an initial rebuild
    await ctx.rebuild();

    // Copy initial files
    for (const filePath of inputFiles) {
        const filename = path.basename(filePath);
        const destPath = path.join(pluginPath, filename);
        try {
            await fs.copyFile(filePath, destPath);
        } catch (e) {
            console.error(`❌ Failed to copy ${filename}:`, e.message);
        }

    }

    // Setup watchers for changed files
    const watcher = chokidar.watch(inputFiles, { ignoreInitial: true });
    watcher.on("change", async (changedPath) => {
        const filename = path.basename(changedPath);
        const destPath = path.join(pluginPath, filename);
        try {
            await fs.copyFile(changedPath, destPath);
            console.log(`🔁 Updated ${filename}`);
        } catch (e) {
            console.error(`❌ Failed to copy ${filename}:`, e.message);
        }
    });


    // Start esbuild watching for changes and re-building
    await ctx.watch();

    console.log("🚀 Dev server started. Watching for changes...");
}

async function dirExists(path) {
    try {
        const stat = await fs.stat(path);
        return stat.isDirectory();
    } catch (err) {
        if (err.code === 'ENOENT') return false;
        throw err;
    }
}


dev().catch((err) => {
    console.error(err);
    process.exit(1);
});