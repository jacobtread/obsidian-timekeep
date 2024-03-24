import React, { useState } from "react";
import { isEmptyString } from "../utils";
import { useTimekeep } from "../hooks/use-timekeep-context";
import { PlayIcon, StopCircleIcon } from "lucide-react";
import { stopRunningEntries, createEntry, isKeepRunning } from "../timekeep";

/**
 * Component for the timekeep start button and "name" field isolating
 * them to prevent needing to re-render the table when typing out the
 * name field
 */
export default function TimekeepStart() {
	const { setTimekeep, isTimekeepRunning } = useTimekeep();
	const [name, setName] = useState("");

	/**
	 * Handles the click of the start/stop button
	 */
	const onClick = () => {
		setTimekeep((timekeep) => {
			// If the timekeep is currently running
			if (isKeepRunning(timekeep)) {
				// Stop the running entry
				return { entries: stopRunningEntries(timekeep.entries) };
			}

			let entryName = name;
			// Assign a name automatically if not provided
			if (isEmptyString(entryName)) {
				entryName = `Block ${timekeep.entries.length + 1}`;
			}

			/// Clear the name input
			setName("");

			return {
				entries: [...timekeep.entries, createEntry(entryName)],
			};
		});
	};

	return (
		<>
			<button
				onClick={onClick}
				title={isTimekeepRunning ? "Stop" : "Start"}
				className="timekeep-start">
				{isTimekeepRunning ? (
					<StopCircleIcon width="1em" height="1em" />
				) : (
					<PlayIcon width="1em" height="1em" />
				)}
			</button>
			<input
				className="timekeep-name"
				placeholder="Block Name"
				type="text"
				value={name}
				onChange={(event) => setName(event.target.value)}
			/>
		</>
	);
}
