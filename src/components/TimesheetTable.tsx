import TimesheetRows from "@/components/TimesheetRows";
import { useTimekeep } from "@/hooks/use-timekeep-context";
import React from "react";

export default function TimesheetTable() {
	const { timekeep } = useTimekeep();

	return (
		<table className="timekeep-table">
			<thead>
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
	);
}
