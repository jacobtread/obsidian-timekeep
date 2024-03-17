import { SetStateAction, useEffect, useState } from "react";
import React from "react";

import {
	Timekeep,
	SaveDetails,
	getEntriesOrdered,
	isKeepRunning,
	save,
	stopRunningEntries,
	createEntry,
	getUniqueEntryHash,
	createCsv,
	createMarkdownTable,
} from "../timekeep";
import TimesheetEntry from "./TimesheetEntry";
import TimesheetCounters from "./TimesheetCounters";
import TimesheetPdf from "./TimesheetPdf";
import { useSettings } from "src/hooks/use-settings-context";
import { isEmptyString } from "src/utils";
import { TimekeepContext } from "src/hooks/use-timekeep-context";
import { PlayIcon, StopCircleIcon } from "lucide-react";
import { usePDF } from "node_modules/@react-pdf/renderer/lib/react-pdf.browser.cjs";

type Props = {
	initialState: Timekeep;
	saveDetails: SaveDetails;
};

export default function Timesheet({ initialState, saveDetails }: Props) {
	const [timekeep, setTimekeepInternal] = useState(initialState);
	const settings = useSettings();
	const [pdfInstance, updatePdfInstance] = usePDF({});

	const [name, setName] = useState("");
	const [isRunning, setRunning] = useState(false);

	// Handle saving timekeep changes
	useEffect(() => {
		updatePdfInstance(
			<TimesheetPdf data={timekeep} title={settings.pdfTitle} />,
		);
	}, [timekeep]);

	// Update the running state and total time when the keep changes
	useEffect(() => {
		setRunning(isKeepRunning(timekeep));
	}, [timekeep, setRunning]);

	// Wrapper around setTimekeep state to persist
	const setTimekeep = (value: SetStateAction<Timekeep>) => {
		setTimekeepInternal((storedValue) => {
			const updatedValue =
				value instanceof Function ? value(storedValue) : value;
			save(updatedValue, saveDetails);
			return updatedValue;
		});
	};

	const onClickStart = () => {
		if (isRunning) {
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
		navigator.clipboard.writeText(createCsv(timekeep, settings));
	};

	const onCopyJSON = () => {
		navigator.clipboard.writeText(JSON.stringify(timekeep));
	};

	const onSavePDF = async () => {
		if (pdfInstance.url === null) return;
		const a = document.createElement("a");
		a.href = pdfInstance.url;
		a.download = "Timesheet.pdf";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	};

	return (
		<TimekeepContext.Provider
			value={{
				timekeep,
				setTimekeep,
				isTimekeepRunning: isRunning,
			}}
		>
			<div className="timekeep-container">
				<button
					onClick={onClickStart}
					title={isRunning ? "Stop" : "Start"}
					className="timekeep-start"
				>
					{isRunning ? (
						<StopCircleIcon width="1em" height="1em" />
					) : (
						<PlayIcon width="1em" height="1em" />
					)}
				</button>
				<TimesheetCounters timekeep={timekeep} isRunning={isRunning} />
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
							),
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
		</TimekeepContext.Provider>
	);
}
