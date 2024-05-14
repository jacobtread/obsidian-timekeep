import moment from "moment";
import { Timekeep } from "@/schema";
import React, { useState, useEffect } from "react";
import { useTimekeep } from "@/contexts/use-timekeep-context";
import { useSettings } from "@/contexts/use-settings-context";
import { formatDuration, formatDurationHoursTrunc } from "@/utils";
import {
	getRunningEntry,
	getTotalDuration,
	getEntryDuration,
} from "@/timekeep";

type TimingState = {
	running: boolean;
	current: string;
	currentShort: string;
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
	const currentTime = moment();
	const total = getTotalDuration(timekeep.entries, currentTime);
	const runningEntry = getRunningEntry(timekeep.entries);
	const current = runningEntry
		? getEntryDuration(runningEntry, currentTime)
		: 0;

	return {
		running: runningEntry !== null,
		current: formatDuration(current),
		currentShort: formatDurationHoursTrunc(current),
		total: formatDuration(total),
		totalShort: formatDurationHoursTrunc(total),
	};
}

export default function TimesheetCounters() {
	const { timekeep, isTimekeepRunning } = useTimekeep();
	const [timing, setTiming] = useState<TimingState>(getTimingState(timekeep));
	const settings = useSettings();

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
					{settings.showDecimalHours && (
						<span className="timekeep-timer-value-small">
							{timing.currentShort}
						</span>
					)}
					<span>Current</span>
				</div>
			)}

			<div className="timekeep-timer">
				<span className="timekeep-timer-value">{timing.total}</span>
				{settings.showDecimalHours && (
					<span className="timekeep-timer-value-small">
						{timing.totalShort}
					</span>
				)}
				<span>Total</span>
			</div>
		</div>
	);
}
