import React, { useState } from "react";
import { updateEntry, withSubEntry, isKeepRunning } from "@/timekeep";
import { useSettings } from "@/hooks/use-settings-context";
import { EditIcon, PlayIcon } from "lucide-react";
import { formatTimestamp } from "src/utils";
import { useTimekeep } from "@/hooks/use-timekeep-context";
import { TimeEntry } from "@/schema";
import moment from "moment";
import TimesheetRowEditing from "@/components/TimesheetRowEditing";
import TimesheetRowDuration from "@/components/TimesheetRowDuration";

type Props = {
	entry: TimeEntry;
	indent: number;
};

export default function TimesheetRow({ entry, indent }: Props) {
	const settings = useSettings();
	const { setTimekeep, isTimekeepRunning } = useTimekeep();

	const [editing, setEditing] = useState(false);

	const isEditable = entry.subEntries !== null || entry.endTime !== null;

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
		indentItems.push(
			<span
				key={i}
				style={{
					display: "inline-block",
					height: "1rem",
					width: "0.2rem",
					borderLeft: "0.1rem solid var(--color-base-40)",
					marginRight: "0.1rem",
				}}
			/>
		);
	}

	return (
		<tr className="timekeep-row">
			<td className="timekeep-col timekeep-col--name">
				{indentItems}

				<span className="timekeep-name" title={entry.name}>
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
						<PlayIcon width="1em" height="1em" />
					</button>
					<button
						disabled={!isEditable}
						onClick={() => setEditing(true)}
						className="timekeep-action">
						<EditIcon width="1em" height="1em" />
					</button>
				</div>
			</td>
		</tr>
	);
}
