import TimesheetRows from "@/components/TimesheetRows";
import { useSettings } from "@/hooks/use-settings-context";
import { useTimekeep } from "@/hooks/use-timekeep-context";
import React from "react";

export default function TimesheetTable() {
	const { timekeep } = useTimekeep();
	const settings = useSettings();

	return (
		<div
			style={
				settings.limitTableSize
					? { maxHeight: 600, overflowY: "auto" }
					: {}
			}>
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
