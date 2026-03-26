import path from "path";
import fs from "fs/promises";
import { build } from "vite";
import { fileURLToPath } from "url";

async function buildPlugin() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const rootPath = path.resolve(__dirname, "../");
    const manifestPath = path.join(rootPath, "manifest.json");
    const outputPath = path.join(rootPath, "dist");

    await ensureDir(outputPath);

    await build({
        configFile: path.resolve(rootPath, "vite.config.js"),
    });

    const destManifest = path.join(outputPath, "manifest.json");
    try {
        await fs.copyFile(manifestPath, destManifest);
        console.info(`Copied manifest.json`);
    } catch (e) {
        console.error(`Failed to copy manifest.json:`, e.message);
    }
}

async function ensureDir(dir) {
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch {}
}

buildPlugin().catch((err) => {
    console.error(err);
    process.exit(1);
});
