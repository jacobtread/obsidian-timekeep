import moment from "moment";
import { TimeEntry } from "@/schema";
import React, { useState } from "react";
import { useSettings } from "@/contexts/use-settings-context";
import { useTimekeep } from "@/contexts/use-timekeep-context";
import TimesheetRowEditing from "@/components/TimesheetRowEditing";
import TimesheetRowDuration from "@/components/TimesheetRowDuration";
import { updateEntry, withSubEntry, isKeepRunning } from "@/timekeep";

import { formatTimestamp } from "src/utils";

import ObsidianIcon from "./ObsidianIcon";

type Props = {
	entry: TimeEntry;
	indent: number;
};

export default function TimesheetRow({ entry, indent }: Props) {
	const settings = useSettings();
	const { setTimekeep, isTimekeepRunning } = useTimekeep();

	const [editing, setEditing] = useState(false);

	const onClickStart = () => {
		setTimekeep((timekeep) => {
			// Don't start if already running
			if (isKeepRunning(timekeep)) {
				return timekeep;
			}

			const startTime = moment();

			return {
				entries: updateEntry(
					timekeep.entries,
					entry,
					withSubEntry(entry, "", startTime)
				),
			};
		});
	};

	if (editing) {
		return (
			<TimesheetRowEditing
				entry={entry}
				onFinishEditing={() => setEditing(false)}
			/>
		);
	}

	// Build up a list of indent lines for each level
	const indentItems = [];
	for (let i = 0; i < indent; i++) {
		indentItems.push(<span key={i} className="timekeep-indent" />);
	}

	return (
		<tr className="timekeep-row">
			<td className="timekeep-col timekeep-col--name">
				{indentItems}

				<span className="timekeep-entry-name" title={entry.name}>
					{entry.name}
				</span>
			</td>
			<td className="timekeep-col timekeep-col--time">
				{entry.startTime && (
					<span className="timekeep-time">
						{formatTimestamp(entry.startTime, settings)}
					</span>
				)}
			</td>
			<td className="timekeep-col timekeep-col--time">
				{entry.endTime && (
					<span className="timekeep-time">
						{formatTimestamp(entry.endTime, settings)}
					</span>
				)}
			</td>
			<td className="timekeep-col timekeep-col--duration">
				<TimesheetRowDuration entry={entry} />
			</td>
			<td className="timekeep-col timekeep-col--actions">
				<div className="timekeep-actions-wrapper">
					<button
						disabled={isTimekeepRunning}
						onClick={onClickStart}
						className="timekeep-action">
						<ObsidianIcon icon="play" className="button-icon" />
					</button>
					<button
						onClick={() => setEditing(true)}
						className="timekeep-action">
						<ObsidianIcon icon="edit" className="button-icon" />
					</button>
				</div>
			</td>
		</tr>
	);
}
