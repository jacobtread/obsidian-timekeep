import React, { useMemo } from "react";
import { isKeepRunning } from "@/timekeep";
import TimesheetRows from "@/components/TimesheetRows";
import { useSettings } from "@/contexts/use-settings-context";
import { useTimekeep, useTimekeepStore } from "@/store/timekeep-store";

export default function TimesheetTable() {
	const store = useTimekeepStore();
	const timekeep = useTimekeep(store);
	const settings = useSettings();

	// Determine whether the keep is running
	const isTimekeepRunning = useMemo(
		() => isKeepRunning(timekeep),
		[timekeep]
	);

	// Max size and scroll for table with "Limit table size" option
	const limitedSize: React.CSSProperties = settings.limitTableSize
		? { maxHeight: 600, overflowY: "auto" }
		: {};

	return (
		<div style={limitedSize}>
			<table className="timekeep-table">
				<thead className="timekeep-table-head">
					<tr>
						<th>Block</th>
						<th>Start time</th>
						<th>End time</th>
						<th>Duration</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<TimesheetRows
						entries={timekeep.entries}
						indent={0}
						isTimekeepRunning={isTimekeepRunning}
					/>
				</tbody>
			</table>
		</div>
	);
}
