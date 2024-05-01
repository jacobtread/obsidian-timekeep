import React, { useMemo } from "react";
import { formatTimestamp } from "@/utils";
import { getRunningEntry } from "@/timekeep";
import { useTimekeep } from "@/hooks/use-timekeep-context";
import { useSettings } from "@/hooks/use-settings-context";

/**
 * Displays the currently running timekeep entry if one is available. Shows
 * the name along with when it was started
 */
export default function TimesheetCurrentEntry() {
	const { timekeep } = useTimekeep();
	const settings = useSettings();
	const currentEntry = useMemo(
		() => getRunningEntry(timekeep.entries),
		[timekeep]
	);

	// Only works when a current entry is active and is not a group entry (Shouldn't be possible?)
	if (currentEntry === null || currentEntry.startTime === null) {
		return null;
	}

	const formattedStartTime = formatTimestamp(
		currentEntry.startTime,
		settings
	);

	return (
		<div className="active-entry">
			<span>
				<b>Currently Running:</b>
			</span>
			<div className="active-entry__details">
				<span className="active-entry__name">
					<b>Name: </b> {currentEntry.name}
				</span>
				<span className="active-entry__time">
					<b>Started at</b>: {formattedStartTime}
				</span>
			</div>
		</div>
	);
}
