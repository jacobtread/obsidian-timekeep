import React from "react";
import moment from "moment";
import { Notice } from "obsidian";
import { Platform } from "obsidian";
import { exportPdf } from "@/export/pdf";
import { createCSV, createMarkdownTable } from "@/export";
import { stripTimekeepRuntimeData } from "@/timekeep/schema";
import { useSettings } from "@/contexts/use-settings-context";
import { useTimekeepStore } from "@/contexts/use-timekeep-store";

export default function TimekeepExportActions() {
	const settings = useSettings();
	const timekeepStore = useTimekeepStore();

	const onCopyMarkdown = () => {
		const timekeep = timekeepStore.getState();
		const currentTime = moment();
		const output = createMarkdownTable(timekeep, settings, currentTime);

		navigator.clipboard
			.writeText(output)
			.then(() => new Notice("Copied markdown to clipboard", 1500))
			.catch((error) => console.error("Failed to copy export", error));
	};

	const onCopyCSV = () => {
		const timekeep = timekeepStore.getState();
		const currentTime = moment();
		const output = createCSV(timekeep, settings, currentTime);

		navigator.clipboard
			.writeText(output)
			.then(() => new Notice("Copied CSV to clipboard", 1500))
			.catch((error) => console.error("Failed to copy export", error));
	};

	const onCopyJSON = () => {
		const timekeep = timekeepStore.getState();
		const output = JSON.stringify(
			stripTimekeepRuntimeData(timekeep),
			undefined,
			settings.formatCopiedJSON ? 4 : undefined
		);

		navigator.clipboard
			.writeText(output)
			.then(() => new Notice("Copied JSON to clipboard", 1500))
			.catch((error) => console.error("Failed to copy export", error));
	};

	const onSavePDF = async () => {
		const timekeep = timekeepStore.getState();
		exportPdf(timekeep, settings);
	};

	return (
		<div className="timekeep-actions">
			<button onClick={onCopyMarkdown}>Copy Markdown</button>
			<button onClick={onCopyCSV}>Copy CSV</button>
			<button onClick={onCopyJSON}>Copy JSON</button>
			{!Platform.isMobileApp && (
				<button onClick={onSavePDF}>Save PDF</button>
			)}
		</div>
	);
}
