import moment from "moment";
import React, { useState } from "react";
import { PlayIcon, StopCircleIcon } from "lucide-react";
import { useTimekeep } from "@/hooks/use-timekeep-context";
import { withEntry, isKeepRunning, stopRunningEntries } from "@/timekeep";

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
			const currentTime = moment();

			// If the timekeep is currently running
			if (isKeepRunning(timekeep)) {
				// Stop the running entry
				return {
					entries: stopRunningEntries(timekeep.entries, currentTime),
				};
			} else {
				/// Clear the name input
				setName("");

				return {
					entries: withEntry(timekeep.entries, name, currentTime),
				};
			}
		});
	};

	return (
		<div className="timekeep-start-area">
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
		</div>
	);
}
