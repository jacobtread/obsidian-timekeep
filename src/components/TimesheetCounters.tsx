import { useEffect, useState } from "react";
import React from "react";

import {
	Timekeep,
	getTotalDuration,
	getRunningEntry,
	getEntryDuration,
} from "../timekeep";
import { formatDuration } from "../utils";

type Props = {
	timekeep: Timekeep;
	isRunning: boolean;
};

export default function TimesheetCounters({ timekeep, isRunning }: Props) {
	const [current, setCurrent] = useState("0s");
	const [total, setTotal] = useState("0s");

	// Update the current timings every second
	useEffect(() => {
		// If we aren't running only update the total initially
		if (!isRunning) {
			const total = getTotalDuration(timekeep.entries);
			setTotal(formatDuration(total));
			return;
		}

		const update = () => {
			const runningEntry = getRunningEntry(timekeep.entries);
			if (runningEntry === null) return;

			const current = getEntryDuration(runningEntry);
			const total = getTotalDuration(timekeep.entries);

			setCurrent(formatDuration(current));
			setTotal(formatDuration(total));
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
				<span>Total</span>
			</div>
		</div>
	);
}
