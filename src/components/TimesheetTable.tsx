import React from "react";
import TimesheetRows from "@/components/TimesheetRows";
import { useSettings } from "@/contexts/use-settings-context";
import { useTimekeep } from "@/contexts/use-timekeep-context";

export default function TimesheetTable() {
	const { timekeep } = useTimekeep();
	const settings = useSettings();

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
					<TimesheetRows entries={timekeep.entries} indent={0} />
				</tbody>
			</table>
		</div>
	);
}
