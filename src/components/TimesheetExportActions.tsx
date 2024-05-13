import React from "react";
import { pdf } from "@/pdf";
import moment from "moment";
import * as path from "path";
import { existsSync } from "fs";
import { Notice } from "obsidian";
import * as electron from "electron";
import { mkdir, writeFile } from "fs/promises";
import { PdfExportBehavior } from "@/settings";
import TimesheetPdf from "@/components/TimesheetPdf";
import { createCSV, createMarkdownTable } from "@/export";
import { useSettings } from "@/hooks/use-settings-context";
import { useTimekeep } from "@/hooks/use-timekeep-context";

export default function TimekeepExportActions() {
	const { timekeep } = useTimekeep();
	const settings = useSettings();

	const onCopyMarkdown = () => {
		const currentTime = moment();
		const output = createMarkdownTable(timekeep, settings, currentTime);

		navigator.clipboard
			.writeText(output)
			.then(() => new Notice("Copied markdown to clipboard", 1500))
			.catch((error) => console.error("Failed to copy export", error));
	};

	const onCopyCSV = () => {
		const currentTime = moment();
		const output = createCSV(timekeep, settings, currentTime);

		navigator.clipboard
			.writeText(output)
			.then(() => new Notice("Copied CSV to clipboard", 1500))
			.catch((error) => console.error("Failed to copy export", error));
	};

	const onCopyJSON = () => {
		const output = JSON.stringify(timekeep);

		navigator.clipboard
			.writeText(output)
			.then(() => new Notice("Copied JSON to clipboard", 1500))
			.catch((error) => console.error("Failed to copy export", error));
	};

	const onSavePDF = async () => {
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

		// Create the PDF
		const createdPdf = pdf(
			<TimesheetPdf
				data={timekeep}
				title={settings.pdfTitle}
				footnote={settings.pdfFootnote}
				currentTime={currentTime}
			/>
		);

		// Create a blob from the PDF
		const buffer = await createdPdf.toBuffer();

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
	};

	return (
		<div className="timekeep-actions">
			<button onClick={onCopyMarkdown}>Copy Markdown</button>
			<button onClick={onCopyCSV}>Copy CSV</button>
			<button onClick={onCopyJSON}>Copy JSON</button>
			<button onClick={onSavePDF}>Save PDF</button>
		</div>
	);
}
