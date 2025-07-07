import moment from "moment";
import { useStore } from "@/store";
import { formatTimestamp } from "@/utils";
import React, { useMemo, useState, FormEvent } from "react";
import { useSettings } from "@/contexts/use-settings-context";
import { useTimekeepStore } from "@/contexts/use-timekeep-store";
import {
	withEntry,
	isKeepRunning,
	getPathToEntry,
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
	const timekeep = useStore(store);
	const [name, setName] = useState("");
	const settings = useSettings();

	const currentEntry = useMemo(
		() => getRunningEntry(timekeep.entries),
		[timekeep]
	);

	const pathToEntry = useMemo(
		() =>
			currentEntry
				? getPathToEntry(timekeep.entries, currentEntry)
				: null,
		[timekeep, currentEntry]
	);

	const isTimekeepRunning = currentEntry !== null;

	const onStart = (event: FormEvent) => {
		// Prevent form submission from reloading Obsidian
		event.preventDefault();
		event.stopPropagation();

		store.setState((timekeep) => {
			const currentTime = moment();
			let entries = timekeep.entries;

			// Stop any already running entries
			if (isKeepRunning(timekeep)) {
				// Stop the running entry
				entries = stopRunningEntries(entries, currentTime);
			}

			/// Clear the name input
			setName("");
			entries = withEntry(entries, name, currentTime);

			return {
				...timekeep,
				entries,
			};
		});
	};

	const onStop = (event: FormEvent) => {
		// Prevent form submission from reloading Obsidian
		event.preventDefault();
		event.stopPropagation();

		store.setState((timekeep) => {
			const currentTime = moment();

			return {
				...timekeep,
				entries: stopRunningEntries(timekeep.entries, currentTime),
			};
		});
	};

	return (
		<div>
			{/* Currently running entry */}
			{currentEntry !== null && currentEntry.startTime !== null && (
				<form
					className="timekeep-start-area"
					data-area="running"
					onSubmitCapture={onStop}>
					<div className="active-entry timekeep-name-wrapper">
						<span>
							<b>Currently Running:</b>
						</span>
						<div className="active-entry__details">
							<span className="active-entry__name">
								<b>Name: </b>{" "}
								{pathToEntry && pathToEntry.length > 0 && (
									<span className="timekeep-path-to-entry">
										{pathToEntry.map((path, index) => (
											<span key={path.id}>
												{path.name}

												{index <
													pathToEntry.length - 1 &&
													" >"}
											</span>
										))}
									</span>
								)}
							</span>
							<span className="active-entry__time">
								<b>{"Started at: "}</b>
								{formatTimestamp(
									currentEntry.startTime,
									settings
								)}
							</span>
						</div>
					</div>

					<button
						type="submit"
						title="Stop"
						className="timekeep-start">
						<ObsidianIcon
							icon="stop-circle"
							className="button-icon"
						/>
					</button>
				</form>
			)}

			{/* Start new entry */}
			<form
				className="timekeep-start-area"
				data-area="start"
				onSubmitCapture={onStart}>
				<div className="timekeep-name-wrapper">
					<label htmlFor="timekeepBlockName">
						Block Name:
						{currentEntry !== null &&
							currentEntry.startTime !== null && (
								<span className="timekeep-start-note">
									Starting a new task will pause the previous
									one
								</span>
							)}
					</label>

					<input
						id="timekeepBlockName"
						className="timekeep-name"
						placeholder="Example Block"
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</div>

				<button
					type="submit"
					title={isTimekeepRunning ? "Stop and start" : "Start"}
					className="timekeep-start">
					<ObsidianIcon icon="play" className="button-icon" />
				</button>
			</form>
		</div>
	);
}
