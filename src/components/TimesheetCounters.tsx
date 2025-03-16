import moment from "moment";
import { useStore } from "@/store";
import { Timekeep } from "@/timekeep/schema";
import React, { useState, useEffect } from "react";
import { useSettings } from "@/contexts/use-settings-context";
import { useTimekeepStore } from "@/contexts/use-timekeep-store";
import { formatDurationLong, formatDurationShort } from "@/utils";
import {
	isKeepRunning,
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
		current: formatDurationLong(current),
		currentShort: formatDurationShort(current),
		total: formatDurationLong(total),
		totalShort: formatDurationShort(total),
	};
}

export default function TimesheetCounters() {
	const settings = useSettings();
	const timekeepStore = useTimekeepStore();
	const timekeep = useStore(timekeepStore);

	const [timing, setTiming] = useState<TimingState>(getTimingState(timekeep));

	// Update the current timings every second
	useEffect(() => {
		const updateTiming = () => setTiming(getTimingState(timekeep));

		// Initial update
		updateTiming();

		// Only schedule further updates if we are running
		if (isKeepRunning(timekeep)) {
			const intervalID = window.setInterval(updateTiming, 1000);

			return () => {
				clearInterval(intervalID);
			};
		}
	}, [timekeep]);

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
