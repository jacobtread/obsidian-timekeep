import React, { useEffect, useState } from "react";

import { getEntryDuration, isEntryRunning } from "@/timekeep";
import { formatDuration } from "@/utils";
import moment from "moment";
import { TimeEntry } from "@/schema";

function getDuration(entry: TimeEntry): string {
	const currentTime = moment();
	const duration = getEntryDuration(entry, currentTime);
	return formatDuration(duration);
}

type Props = {
	entry: TimeEntry;
};

export default function TimesheetRowDuration({ entry }: Props) {
	const [duration, setDuration] = useState(getDuration(entry));

	// Update the current timings every second
	useEffect(() => {
		const isRunning = isEntryRunning(entry);
		const updateTiming = () => setDuration(getDuration(entry));

		// Initial update
		updateTiming();

		// Only schedule further updates if we are running
		if (isRunning) {
			const intervalID = window.setInterval(updateTiming, 1000);

			return () => {
				clearInterval(intervalID);
			};
		}
	}, [entry]);

	return <span className="timekeep-time">{duration}</span>;
}
