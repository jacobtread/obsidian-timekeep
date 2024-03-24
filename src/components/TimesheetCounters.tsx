import React, { useEffect, useState } from "react";

import {
	getTotalDuration,
	getRunningEntry,
	getEntryDuration,
} from "../timekeep";
import { formatDuration, formatDurationHoursTrunc } from "../utils";
import { useTimekeep } from "src/hooks/use-timekeep-context";
import { Timekeep } from "src/schema";

type TimingState = {
	running: boolean;
	current: string;
	total: string;
	totalShort: string;
};

/**
 * Gets the timing state for the provided timekeep
 *
 * @param timekeep The timekeep to get the state for
 * @returns The timing state
 */
function getTimingState(timekeep: Timekeep): TimingState {
	const total = getTotalDuration(timekeep.entries);
	const runningEntry = getRunningEntry(timekeep.entries);
	const current = runningEntry ? getEntryDuration(runningEntry) : 0;

	return {
		running: runningEntry !== null,
		current: formatDuration(current),
		total: formatDuration(total),
		totalShort: formatDurationHoursTrunc(total),
	};
}

export default function TimesheetCounters() {
	const { timekeep, isTimekeepRunning } = useTimekeep();
	const [timing, setTiming] = useState<TimingState>(getTimingState(timekeep));

	// Update the current timings every second
	useEffect(() => {
		const updateTiming = () => setTiming(getTimingState(timekeep));

		// Initial update
		updateTiming();

		// Only schedule further updates if we are running
		if (isTimekeepRunning) {
			const intervalID = window.setInterval(updateTiming, 1000);

			return () => {
				clearInterval(intervalID);
			};
		}
	}, [timekeep, isTimekeepRunning]);

	return (
		<div className="timekeep-timers">
			{timing.running && (
				<div className="timekeep-timer">
					<span className="timekeep-timer-value">
						{timing.current}
					</span>
					<span>Current</span>
				</div>
			)}

			<div className="timekeep-timer">
				<span className="timekeep-timer-value">{timing.total}</span>
				<span className="timekeep-timer-value-small">
					{timing.totalShort}
				</span>
				<span>Total</span>
			</div>
		</div>
	);
}
