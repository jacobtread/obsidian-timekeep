const path = require("path");
const fs = require('fs/promises');
const esbuild = require("esbuild");

const esbuildConfig = require('../esbuild.config');

async function build() {
    const rootPath = path.join(__dirname, "../");
    const manifestPath = path.join(rootPath, "manifest.json");
    const outputPath = path.join(rootPath, "dist");
    const srcPath = path.join(rootPath, "src");

    // Setup output path
    const outputExists = await dirExists(outputPath);
    if (!outputExists) {
        fs.mkdir(outputPath, { recursive: true });
    }

    // Perform a build
    await esbuild.build({
        ...esbuildConfig,
        entryPoints:
            [
                path.join(srcPath, "main.ts"),
                path.join(srcPath, 'styles.css'),
            ],
        bundle: true,
        outdir: path.join(outputPath),
    });

    // Copy files from outside build
    for (const filePath of [manifestPath]) {
        const filename = path.basename(filePath);
        const destPath = path.join(outputPath, filename);
        try {
            await fs.copyFile(filePath, destPath);
        } catch (e) {
            console.error(`❌ Failed to copy ${filename}:`, e.message);
        }
    }
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


build().catch((err) => {
    console.error(err);
    process.exit(1);
});