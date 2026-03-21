import moment from "moment";
import { useStore } from "@/store";
import { formatDuration } from "@/utils";
import { Timekeep } from "@/timekeep/schema";
import { TimekeepSettings } from "@/settings";
import React, { useState, useEffect } from "react";
import { useSettings } from "@/contexts/use-settings-context";
import { useTimekeepStore } from "@/contexts/use-timekeep-store";
import {
	isKeepRunning,
	getRunningEntry,
	getTotalDuration,
	getEntryDuration,
} from "@/timekeep";

type TimingState = {
	running: boolean;
	currentPrimary: string;
	currentSecondary: string;
	totalPrimary: string;
	totalSecondary: string;
};

/**
 * Gets the timing state for the provided timekeep
 *
 * @param timekeep The timekeep to get the state for
 * @returns The timing state
 */
function getTimingState(
	timekeep: Timekeep,
	settings: TimekeepSettings
): TimingState {
	const currentTime = moment();
	const total = getTotalDuration(timekeep.entries, currentTime);
	const runningEntry = getRunningEntry(timekeep.entries);
	const current = runningEntry
		? getEntryDuration(runningEntry, currentTime)
		: 0;

	return {
		running: runningEntry !== null,
		currentPrimary: formatDuration(settings.primaryDurationFormat, current),
		currentSecondary: formatDuration(
			settings.secondaryDurationFormat,
			current
		),
		totalPrimary: formatDuration(settings.primaryDurationFormat, total),
		totalSecondary: formatDuration(settings.secondaryDurationFormat, total),
	};
}

export default function TimesheetCounters() {
	const settings = useSettings();
	const timekeepStore = useTimekeepStore();
	const timekeep = useStore(timekeepStore);

	const [timing, setTiming] = useState<TimingState>(
		getTimingState(timekeep, settings)
	);

	// Update the current timings every second
	useEffect(() => {
		const updateTiming = () =>
			setTiming(getTimingState(timekeep, settings));

		// Initial update
		updateTiming();

		// Only schedule further updates if we are running
		if (isKeepRunning(timekeep)) {
			const intervalID = window.setInterval(updateTiming, 1000);

			return () => {
				clearInterval(intervalID);
			};
		}
	}, [timekeep, settings]);

	return (
		<div className="timekeep-timers">
			{timing.running && (
				<div className="timekeep-timer">
					<span className="timekeep-timer-value">
						{timing.currentPrimary}
					</span>
					{timing.currentSecondary !== "" && (
						<span className="timekeep-timer-value-small">
							{timing.currentSecondary}
						</span>
					)}
					<span>Current</span>
				</div>
			)}

			<div className="timekeep-timer">
				<span className="timekeep-timer-value">
					{timing.totalPrimary}
				</span>
				{timing.totalSecondary !== "" && (
					<span className="timekeep-timer-value-small">
						{timing.totalSecondary}
					</span>
				)}
				<span>Total</span>
			</div>
		</div>
	);
}
