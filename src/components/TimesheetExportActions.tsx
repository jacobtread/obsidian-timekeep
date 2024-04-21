import React from "react";

import { pdf } from "@/pdf";
import { createCSV, createMarkdownTable } from "@/export";
import { useSettings } from "@/hooks/use-settings-context";
import { useTimekeep } from "@/hooks/use-timekeep-context";
import moment from "moment";

import TimesheetPdf from "@/components/TimesheetPdf";

export default function TimekeepExportActions() {
	const { timekeep } = useTimekeep();
	const settings = useSettings();

	const onCopyMarkdown = () => {
		const currentTime = moment();
		navigator.clipboard.writeText(
			createMarkdownTable(timekeep, settings, currentTime)
		);
	};

	const onCopyCSV = () => {
		const currentTime = moment();
		navigator.clipboard.writeText(
			createCSV(timekeep, settings, currentTime)
		);
	};

	const onCopyJSON = () => {
		navigator.clipboard.writeText(JSON.stringify(timekeep));
	};

	const onSavePDF = async () => {
		const currentTime = moment();

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
