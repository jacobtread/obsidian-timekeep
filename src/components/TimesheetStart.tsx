import moment from "moment";
import { formatTimestamp } from "@/utils";
import React, { useMemo, useState, FormEvent } from "react";
import { useSettings } from "@/contexts/use-settings-context";
import { useTimekeep, useTimekeepStore } from "@/store/timekeep-store";
import {
	withEntry,
	isKeepRunning,
	getRunningEntry,
	stopRunningEntries,
} from "@/timekeep";

import ObsidianIcon from "./ObsidianIcon";

/**
 * Component for the timekeep start button and "name" field isolating
 * them to prevent needing to re-render the table when typing out the
 * name field
 */
export default function TimekeepStart() {
	const store = useTimekeepStore();
	const timekeep = useTimekeep(store);
	const [name, setName] = useState("");
	const settings = useSettings();

	const currentEntry = useMemo(
		() => getRunningEntry(timekeep.entries),
		[timekeep]
	);

	const isTimekeepRunning = currentEntry !== null;

	/**
	 * Handles the click of the start/stop button
	 */
	const onSubmit = (event: FormEvent) => {
		// Prevent form submission from reloading Obsidian
		event.preventDefault();
		event.stopPropagation();

		store.setTimekeep((timekeep) => {
			const currentTime = moment();
			let entries;

			// If the timekeep is currently running
			if (isKeepRunning(timekeep)) {
				// Stop the running entry
				entries = stopRunningEntries(timekeep.entries, currentTime);
			} else {
				/// Clear the name input
				setName("");
				entries = withEntry(timekeep.entries, name, currentTime);
			}

			return {
				...timekeep,
				entries,
			};
		});
	};

	return (
		<form className="timekeep-start-area" onSubmitCapture={onSubmit}>
			{currentEntry !== null && currentEntry.startTime !== null ? (
				<div className="active-entry timekeep-name-wrapper">
					<span>
						<b>Currently Running:</b>
					</span>
					<div className="active-entry__details">
						<span className="active-entry__name">
							<b>Name: </b> {currentEntry.name}
						</span>
						<span className="active-entry__time">
							<b>{"Started at: "}</b>
							{formatTimestamp(currentEntry.startTime, settings)}
						</span>
					</div>
				</div>
			) : (
				<div className="timekeep-name-wrapper">
					<label htmlFor="timekeepBlockName">Block Name:</label>
					<input
						id="timekeepBlockName"
						className="timekeep-name"
						placeholder="Example Block"
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</div>
			)}
			<button
				type="submit"
				title={isTimekeepRunning ? "Stop" : "Start"}
				className="timekeep-start">
				{isTimekeepRunning ? (
					<ObsidianIcon icon="stop-circle" className="button-icon" />
				) : (
					<ObsidianIcon icon="play" className="button-icon" />
				)}
			</button>
		</form>
	);
}
