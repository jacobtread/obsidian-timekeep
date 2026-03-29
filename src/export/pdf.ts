import moment from "moment";
import { App, Notice, Platform } from "obsidian";

import { createPdfExport, createPdfExportBlob } from "@/components/pdf/renderer";
import { TimekeepSettings, PdfExportBehavior } from "@/settings";
import { Timekeep } from "@/timekeep/schema";
import { FileNamePromptModal } from "@/views/file-name-prompt-modal";

export async function exportPdf(app: App, timekeep: Timekeep, settings: TimekeepSettings) {
	if (Platform.isMobileApp) {
		return exportPdfMobile(app, timekeep, settings);
	} else {
		return exportPdfDesktop(timekeep, settings);
	}
}

async function exportPdfMobile(app: App, timekeep: Timekeep, settings: TimekeepSettings) {
	const currentTime = moment();
	const blob = await createPdfExportBlob(timekeep, settings, currentTime);
	const buffer = await blob.arrayBuffer();
	const fileName = await FileNamePromptModal.pick(app);

	if (!fileName) return;

	const folder = settings.pdfMobileExportsFolder;
	const path = `${folder}/${fileName}`;

	if (!app.vault.getAbstractFileByPath(folder)) {
		await app.vault.createFolder(folder);
	}

	await app.vault.createBinary(path, buffer);
	new Notice("Saved exported PDF");
}

async function exportPdfDesktop(timekeep: Timekeep, settings: TimekeepSettings) {
	// Dynamic imports to prevent them from causing errors when loaded (Because they are unsupported on mobile)
	const electron = await import("electron");
	const { mkdir, writeFile } = await import("fs/promises");
	const { existsSync } = await import("fs");
	const path = await import("path");

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

	const buffer = await createPdfExport(timekeep, settings, currentTime);

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
