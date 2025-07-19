import moment from "moment";
import * as path from "path";
import { existsSync } from "fs";
import { Notice, Platform } from "obsidian";
import { Timekeep } from "@/timekeep/schema";
import { mkdir, writeFile } from "fs/promises";
import { TimekeepSettings, PdfExportBehavior } from "@/settings";

export async function exportPdf(
	timekeep: Timekeep,
	settings: TimekeepSettings
) {
	// Pdf exports don't work in mobile mode
	if (Platform.isMobileApp) return;

	// Dynamic imports to prevent them from causing errors when loaded (Because they are unsupported on mobile)
	const electron = require("electron");
	const pdfModule = require("@/components/pdf");

	const currentTime = moment();

	// Prompt user for save location
	const result = await electron.remote.dialog.showSaveDialog({
		title: "Save timesheet",
		defaultPath: "Timesheet.pdf",
		filters: [{ extensions: ["pdf"], name: "PDF" }],
		properties: ["showOverwriteConfirmation", "createDirectory"],
	});

	if (result.canceled) {
		return;
	}

	const outputPath = result.filePath;
	if (outputPath === undefined) {
		return;
	}

	const buffer = await pdfModule.createPdf(timekeep, settings, currentTime);

	const fullOutputPath = path.normalize(outputPath);
	const fullOutputDir = path.dirname(fullOutputPath);

	// Create output directory if missing
	if (!existsSync(fullOutputDir)) {
		await mkdir(fullOutputDir);
	}

	try {
		await writeFile(outputPath, buffer);

		new Notice("Export successful", 1500);

		// Open the directory using the system explorer
		if (settings.pdfExportBehavior == PdfExportBehavior.OPEN_PATH) {
			electron.remote.shell.showItemInFolder(fullOutputPath);
		}

		// Open the exported file
		if (settings.pdfExportBehavior == PdfExportBehavior.OPEN_FILE) {
			await electron.remote.shell.openPath(fullOutputPath);
		}
	} catch (error) {
		console.error("Failed to write pdf file", error);
	}
}
