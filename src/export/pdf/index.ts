import type { Moment } from "moment";

import moment from "moment";
import { App, Notice, Platform } from "obsidian";
import pdfMake from "pdfmake";

import type { TimekeepSettings } from "@/settings";

import { PdfExportBehavior } from "@/settings";

import { createPdfDefinition } from "./definition";

import { FileNamePromptModal } from "@/modals/FileNamePromptModal";

import type { Timekeep } from "@/timekeep/schema";
// Load in the required fonts
import "./fonts";

/** Required to handle mocking the imports during tests */
export const desktopModuleLoader = {
	/* v8 ignore start -- @preserve */
	importModule: (name: string): any => {
		return require(name);
	},
	/* v8 ignore stop -- @preserve */
};

/**
 * Export the timekeep as a PDF
 *
 * @param app
 * @param timekeep
 * @param settings
 * @returns
 */
export async function exportPdf(app: App, timekeep: Timekeep, settings: TimekeepSettings) {
	const currentTime = moment();

	try {
		if (Platform.isMobileApp) {
			await exportPdfMobile(app, timekeep, settings, currentTime);
		} else {
			await exportPdfDesktop(timekeep, settings, currentTime);
		}
		new Notice("PDF export successful", 1500);
	} catch (error) {
		console.error("Failed to write pdf file", error);
		new Notice("Failed to export PDF file");
	}
}

/**
 * Export the timekeep as a PDF on a mobile device
 *
 * @param app
 * @param timekeep
 * @param settings
 * @returns
 */
async function exportPdfMobile(
	app: App,
	timekeep: Timekeep,
	settings: TimekeepSettings,
	currentTime: Moment
) {
	const fileName = await FileNamePromptModal.pick(app);
	if (!fileName) return;

	const folder = settings.pdfMobileExportsFolder;
	const path = `${folder}/${fileName}`;

	const blob = await createPdfExportBlob(timekeep, settings, currentTime);
	const buffer = await blob.arrayBuffer();

	if (app.vault.getAbstractFileByPath(folder) === null) {
		await app.vault.createFolder(folder);
	}

	await app.vault.createBinary(path, buffer);
}

/**
 * Export the timekeep as a PDF on a desktop device
 *
 * @param timekeep The timekeep to export
 * @param settings The timekeep settings
 * @returns Promise for when the export is complete
 */
async function exportPdfDesktop(
	timekeep: Timekeep,
	settings: TimekeepSettings,
	currentTime: Moment
): Promise<void> {
	// Dynamic imports to prevent them from causing errors when loaded (Because they are unsupported on mobile)
	const {
		remote: {
			dialog: { showSaveDialog },
			shell: { showItemInFolder, openPath },
		},
	} = desktopModuleLoader.importModule("electron");
	const { mkdir, writeFile } = desktopModuleLoader.importModule("fs/promises");
	const { existsSync } = desktopModuleLoader.importModule("fs");
	const { normalize, dirname } = desktopModuleLoader.importModule("path");

	// Prompt user for save location
	const result = await showSaveDialog({
		title: "Save timesheet",
		defaultPath: "Timesheet.pdf",
		filters: [{ extensions: ["pdf"], name: "PDF" }],
		properties: ["showOverwriteConfirmation", "createDirectory"],
	});

	if (result.canceled) return;

	const outputPath = result.filePath;
	if (outputPath === undefined) return;

	const blob = await createPdfExportBlob(timekeep, settings, currentTime);
	const buffer = await blob.arrayBuffer();

	const fullOutputPath = normalize(outputPath);
	const fullOutputDir = dirname(fullOutputPath);

	// Create output directory if missing
	if (!existsSync(fullOutputDir)) {
		await mkdir(fullOutputDir);
	}

	await writeFile(outputPath, new DataView(buffer));

	// Open the directory using the system explorer
	if (settings.pdfExportBehavior == PdfExportBehavior.OPEN_PATH) {
		await showItemInFolder(fullOutputPath);
	}
	// Open the exported file
	else if (settings.pdfExportBehavior == PdfExportBehavior.OPEN_FILE) {
		await openPath(fullOutputPath);
	}
}

/**
 * Create a timekeep PDF export as a Blob
 *
 * @param timekeep The timekeep to export
 * @param settings The timekeep settings
 * @param currentTime The current time
 * @returns The timekeep PDF blob for exporting
 */
async function createPdfExportBlob(
	timekeep: Timekeep,
	settings: TimekeepSettings,
	currentTime: Moment
): Promise<Blob> {
	const definition = createPdfDefinition(timekeep, settings, currentTime);
	const pdf = pdfMake.createPdf(definition, {});
	return await pdf.getBlob();
}
