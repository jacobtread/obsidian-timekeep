import React, { useEffect, useState } from "react";

import { getEntryDuration, isEntryRunning } from "@/timekeep";
import { formatDuration } from "@/utils";
import moment from "moment";
import { TimeEntry } from "@/schema";

/**
 * Obtains the formatted duration string for an entry
 *
 * @param entry The entry
 * @returns The formatted duration
 */
function getDuration(entry: TimeEntry): string {
	const currentTime = moment();
	const duration = getEntryDuration(entry, currentTime);
	return formatDuration(duration);
}

type Props = {
	entry: TimeEntry;
};

/**
 * Component for rendering the duration of a timesheet row, this is separate from
 * the row because actively running durations will update every second to get the
 * latest duration.
 */
export default function TimesheetRowDuration({ entry }: Props) {
	const [duration, setDuration] = useState(getDuration(entry));

	useEffect(() => {
		const isRunning = isEntryRunning(entry);
		const updateTiming = () => setDuration(getDuration(entry));

		// Initial update
		updateTiming();

		// Only schedule further updates if we are running
		if (isRunning) {
			// Update the current timings every second
			const intervalID = window.setInterval(updateTiming, 1000);

			return () => {
				clearInterval(intervalID);
			};
		}
	}, [entry]);

	return <span className="timekeep-time">{duration}</span>;
}
