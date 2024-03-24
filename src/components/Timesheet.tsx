import { useState } from "react";
import React from "react";

import {
	getEntriesOrdered,
	stopRunningEntries,
	createEntry,
	getUniqueEntryHash,
} from "../timekeep";
import TimesheetEntry from "./TimesheetEntry";
import TimesheetCounters from "./TimesheetCounters";
import TimesheetPdf from "./TimesheetPdf";
import { useSettings } from "src/hooks/use-settings-context";
import { isEmptyString } from "src/utils";
import { useTimekeep } from "src/hooks/use-timekeep-context";
import { PlayIcon, StopCircleIcon } from "lucide-react";
import { pdf } from "node_modules/@react-pdf/renderer/lib/react-pdf.browser.cjs";
import { createCSV, createMarkdownTable } from "../export";

export default function Timesheet() {
	const { timekeep, setTimekeep, isTimekeepRunning } = useTimekeep();

	const settings = useSettings();

	const [name, setName] = useState("");

	const onClickStart = () => {
		if (isTimekeepRunning) {
			// Stop the running entry
			setTimekeep((timekeep) => ({
				entries: stopRunningEntries(timekeep.entries),
			}));
		} else {
			let entryName = name;

			setTimekeep((timekeep) => {
				// Assign a name automatically if not provided
				if (isEmptyString(entryName)) {
					entryName = `Block ${timekeep.entries.length + 1}`;
				}

				return {
					entries: [...timekeep.entries, createEntry(entryName)],
				};
			});

			// Clear the name input
			setName("");
		}
	};

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
		<div className="timekeep-container">
			<button
				onClick={onClickStart}
				title={isTimekeepRunning ? "Stop" : "Start"}
				className="timekeep-start">
				{isTimekeepRunning ? (
					<StopCircleIcon width="1em" height="1em" />
				) : (
					<PlayIcon width="1em" height="1em" />
				)}
			</button>
			<TimesheetCounters
				timekeep={timekeep}
				isRunning={isTimekeepRunning}
			/>
			<input
				className="timekeep-name"
				placeholder="Block Name"
				type="text"
				value={name}
				onChange={(event) => {
					setName(event.target.value);
				}}
			/>
			<table className="timekeep-table">
				<thead>
					<tr>
						<th>Block</th>
						<th>Start time</th>
						<th>End time</th>
						<th>Duration</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{getEntriesOrdered(timekeep.entries, settings).map(
						(entry) => (
							<TimesheetEntry
								entry={entry}
								key={getUniqueEntryHash(entry)}
								indent={0}
							/>
						)
					)}
				</tbody>
			</table>
			<div className="timekeep-actions">
				<button onClick={onCopyMarkdown}>Copy Markdown</button>
				<button onClick={onCopyCSV}>Copy CSV</button>
				<button onClick={onCopyJSON}>Copy JSON</button>
				<button onClick={onSavePDF}>Save PDF</button>
			</div>
		</div>
	);
}
