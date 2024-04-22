import { TimeEntry } from "@/schema";
import React, { useState, useEffect } from "react";
import { removeEntry, updateEntry } from "@/timekeep";
import { useSettings } from "@/hooks/use-settings-context";
import { XIcon, CheckIcon, TrashIcon } from "lucide-react";
import { useTimekeep } from "@/hooks/use-timekeep-context";
import { formatEditableTimestamp, unformatEditableTimestamp } from "@/utils";

type Props = {
	entry: TimeEntry;
	onFinishEditing: VoidFunction;
};

export default function TimesheetRowEditing({ entry, onFinishEditing }: Props) {
	const settings = useSettings();
	const { setTimekeep } = useTimekeep();

	const [name, setName] = useState(entry.name);
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");

	useEffect(() => {
		setName(entry.name);
		setStartTime(
			entry.startTime
				? formatEditableTimestamp(entry.startTime, settings)
				: ""
		);
		setEndTime(
			entry.endTime
				? formatEditableTimestamp(entry.endTime, settings)
				: ""
		);
	}, [entry]);

	const onClickDelete = () => {
		if (!confirm("Are you sure you want to delete this entry?")) {
			return;
		}

		setTimekeep((timekeep) => ({
			entries: removeEntry(timekeep.entries, entry),
		}));
	};

	const onClickEdit = () => {
		const newEntry = { ...entry, name };

		// Update the start and end times for non groups
		if (newEntry.subEntries === null) {
			if (entry.startTime !== null) {
				const startTimeValue = unformatEditableTimestamp(
					startTime,
					settings
				);
				if (startTimeValue.isValid()) {
					newEntry.startTime = startTimeValue;
				}
			}

			if (entry.endTime !== null) {
				const endTimeValue = unformatEditableTimestamp(
					endTime,
					settings
				);
				if (endTimeValue.isValid()) {
					newEntry.endTime = endTimeValue;
				}
			}
		}

		// Save the updated entry
		setTimekeep((timekeep) => ({
			entries: updateEntry(timekeep.entries, entry, newEntry),
		}));

		onFinishEditing();
	};

	return (
		<tr>
			<td colSpan={5}>
				<div className="timesheet-editing">
					<label>
						Name
						<input
							className="timekeep-input"
							type="text"
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</label>
					{entry.startTime && (
						<label>
							Start Time
							<input
								className="timekeep-input"
								type="text"
								value={startTime}
								onChange={(event) =>
									setStartTime(event.target.value)
								}
							/>
						</label>
					)}
					{entry.endTime && (
						<label>
							End Time
							<input
								className="timekeep-input"
								type="text"
								value={endTime}
								onChange={(event) =>
									setEndTime(event.target.value)
								}
							/>
						</label>
					)}
					<div className="timesheet-editing-actions">
						<button
							onClick={onClickEdit}
							className="timekeep-action">
							<CheckIcon
								width="1em"
								height="1em"
								style={{ marginRight: "0.25rem" }}
							/>
							Save
						</button>
						<button
							onClick={onFinishEditing}
							className="timekeep-action">
							<XIcon
								width="1em"
								height="1em"
								style={{ marginRight: "0.25rem" }}
							/>
							Cancel
						</button>
						<button
							onClick={onClickDelete}
							className="timekeep-action timekeep-action--end">
							<TrashIcon
								width="1em"
								height="1em"
								style={{ marginRight: "0.25rem" }}
							/>
							Delete
						</button>
					</div>
				</div>
			</td>
		</tr>
	);
}
