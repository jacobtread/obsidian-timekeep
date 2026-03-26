import path from "path";
import fs from "fs/promises";
import { build } from "vite";
import { fileURLToPath } from "url";

async function dev() {
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);
	const rootPath = path.resolve(__dirname, "../");
	const manifestPath = path.join(rootPath, "manifest.json");
	const outputPath = path.join(rootPath, "dist");

	const manifestContents = await fs.readFile(manifestPath, "utf-8");
	const manifest = JSON.parse(manifestContents);

	const vaultPath = path.join(rootPath, "test-vault");
	const pluginPath = path.join(vaultPath, ".obsidian", "plugins", manifest.id);

	await ensureDir(pluginPath);
	await ensureDir(outputPath);

	const inputFiles = [
		path.join(outputPath, "main.js"),
		path.join(outputPath, "styles.css"),
		manifestPath,
	];

	void build({
		mode: "development",
		configFile: path.resolve(rootPath, "vite.config.js"),
		build: {
			watch: {},
		},
		plugins: [
			{
				name: "build-finish-copy",
				closeBundle() {
					console.info("Build finished copying files");
					void copyFiles();
				},
			},
		],
	});

	const copyFiles = async () => {
		for (const filePath of inputFiles) {
			const destPath = path.join(pluginPath, path.basename(filePath));
			try {
				await fs.copyFile(filePath, destPath);
				console.info(`✓ Updated ${path.basename(filePath)}`);
			} catch (e) {
				console.error(`Failed to copy ${path.basename(filePath)}:`, e.message);
			}
		}
	};

	console.info("🚀 Dev server started. Watching for changes...");
}

async function ensureDir(dir) {
	try {
		await fs.mkdir(dir, { recursive: true });
	} catch {}
}

dev().catch((err) => {
	console.error(err);
	process.exit(1);
});
