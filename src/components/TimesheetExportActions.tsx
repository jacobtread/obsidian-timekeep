import React from "react";

import { pdf } from "@/pdf";
import { createCSV, createMarkdownTable } from "@/export";
import { useSettings } from "@/hooks/use-settings-context";
import { useTimekeep } from "@/hooks/use-timekeep-context";

import TimesheetPdf from "@/components/TimesheetPdf";

export default function TimekeepExportActions() {
	const { timekeep } = useTimekeep();
	const settings = useSettings();

	const onCopyMarkdown = () => {
		navigator.clipboard.writeText(createMarkdownTable(timekeep, settings));
	};

	const onCopyCSV = () => {
		navigator.clipboard.writeText(createCSV(timekeep, settings));
	};

	const onCopyJSON = () => {
		navigator.clipboard.writeText(JSON.stringify(timekeep));
	};

	const onSavePDF = async () => {
		// Create the PDF
		const createdPdf = pdf(
			<TimesheetPdf data={timekeep} title={settings.pdfTitle} />
		);

		// Create a blob from the PDF
		const blob = await createdPdf.toBlob();

		// Create an object URL from the PDF
		const url = URL.createObjectURL(blob);

		// Create and click a download link for the file
		const a = document.createElement("a");
		a.href = url;
		a.download = "Timesheet.pdf";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
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
