import moment from "moment";
import { formatDurationLong } from "@/utils";
import { TimeEntry } from "@/timekeep/schema";
import React, { useState, useEffect } from "react";
import { isEntryRunning, getEntryDuration } from "@/timekeep";

type Props = {
	entry: TimeEntry;
};

/**
 * Component for rendering the duration of a timesheet row, this is separate from
 * the row because actively running durations will update every second to get the
 * latest duration.
 */
export default function TimesheetRowDuration({ entry }: Props) {
	const [duration, setDuration] = useState(getFormattedDuration(entry));

	useEffect(() => {
		const isRunning = isEntryRunning(entry);
		const updateTiming = () => setDuration(getFormattedDuration(entry));

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

/**
 * Obtains the formatted duration string for an entry
 *
 * @param entry The entry
 * @returns The formatted duration
 */
function getFormattedDuration(entry: TimeEntry): string {
	const currentTime = moment();
	const duration = getEntryDuration(entry, currentTime);
	return formatDurationLong(duration);
}
