import { useEffect, useState } from "react";
import React from "react";

import {
	getTotalDuration,
	getRunningEntry,
	getEntryDuration,
} from "../timekeep";
import { formatDuration, formatDurationHoursTrunc } from "../utils";
import { Timekeep } from "../schema";

type Props = {
	timekeep: Timekeep;
	isRunning: boolean;
};

export default function TimesheetCounters({ timekeep, isRunning }: Props) {
	const [current, setCurrent] = useState("0s");
	const [total, setTotal] = useState("0s");
	const [totalShort, setTotalShort] = useState("0.00h");

	// Update the current timings every second
	useEffect(() => {
		// If we aren't running only update the total initially
		if (!isRunning) {
			const total = getTotalDuration(timekeep.entries);
			setTotal(formatDuration(total));
			setTotalShort(formatDurationHoursTrunc(total));
			return;
		}

		const update = () => {
			const runningEntry = getRunningEntry(timekeep.entries);
			if (runningEntry === null) return;

			const current = getEntryDuration(runningEntry);
			const total = getTotalDuration(timekeep.entries);

			setCurrent(formatDuration(current));
			setTotal(formatDuration(total));
			setTotalShort(formatDurationHoursTrunc(total));
		};

		update();

		const intervalID = window.setInterval(update, 1000);

		return () => {
			clearInterval(intervalID);
		};
	}, [timekeep, isRunning, setTotal, setCurrent]);

	return (
		<div className="timekeep-timers">
			{isRunning && (
				<div className="timekeep-timer">
					<span className="timekeep-timer-value">{current}</span>
					<span>Current</span>
				</div>
			)}
			<div className="timekeep-timer">
				<span className="timekeep-timer-value">{total}</span>
				<span className="timekeep-timer-value-small">{totalShort}</span>
				<span>Total</span>
			</div>
		</div>
	);
}
